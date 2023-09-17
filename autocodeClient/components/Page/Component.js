

const React = require("react");

import  { useEffect, useState, useMemo, useCallback } from "react";
import ElementMapping from './ElementMapping';


import DocumentServices from '../../libs/services/documnets';

import { getStateValue, updateStateValue, getStateRef } from '../../utils/element-value';


const Component = (props) => {

    const { component, node, _states, pages, _setStates, children, _id } = props;

    const comp = pages[component._id];

    if(!comp)
    return null;

    const [events, setEvents] = useState(comp.events);

    const [loading, setLoading] = useState(false);


    const [states, setStates] = useState(comp.states);
    const [colStates, setColStates] = useState({ ...comp.collStates, loading: 0,  error: 0 });
    const [isFilterChange, setFilters] = useState(false);

 

    const getValue = (elem, value = '') => {
        const type = elem.type;
        const key = elem.key;

        switch (type) {
            case 'PROPS':
                return getStateValue(key, _states);
            case 'STATES':
                return getStateValue(key, states);

            default:
                return value;
        }

    }


    const filters = useMemo(() => {

        let _filters = [];

        if (!colStates.filters)
            return _filters;


        _filters = Object.values(colStates.filters).map(filter => {
            // const key = filter.type ? [filter.type,
            // ...(Array.isArray(filter.key) ? filter.key : [])] : []
            const type = filter.triggerType;
            const key = filter.triggerKey;
            const value = filter.defaultValue;

            let defaultValue = getValue({ type, key }, value);

            if (typeof defaultValue === 'string') {
                if (defaultValue.includes('all'))
                    defaultValue = '';
            }

            // if (key[0] == '__relationship__')
            //     defaultValue = filter.defaultRelationshipsFilter?.map(val => val._id);

            return { name: filter.name, filterKey: [filter.type, ...filter.filterKey], defaultValue: defaultValue || '' }
        }
        )


        return _filters;

    }, [colStates.filters, states, _states]);


    const laodDocumnents = async (collection) => {
        try {
            const collectionId = collection._id;
            let limit = collection.limit || 10;
            let page = collection.page || 1;
            let sortBy = collection.sortBy || 'createdAt';
            let sort = collection.sort || 'acs';
            let loadMore = collection.loadMore;
            const withRelationship = collection.withRelationship;
            const docs = collection.docs || [];
            const selectedRelationships = collection.selectedRelationships || [];
            const states = collection.states || {};

            let documents = [];
            let maxPage = collection.maxPage || 0;


            if (Array.isArray(docs) && docs?.length > 0) {
                const res = await DocumentServices.getFilteredDocuments(collectionId, { documentIds: docs.map(doc => doc._id), filters, selectedRelationships, withRelationship });
                console.log(res)

                documents = Array.isArray(res.documents) ? res.documents : [];
                maxPage = res.total;

            }
            else {


                const res = await DocumentServices.getAllFilteredDocuments(collectionId,
                    { filters, withRelationship, selectedRelationships },
                    parseInt(page || 1),
                    parseInt(limit || 25),
                    sortBy || 'createdAt',
                    sort || 'acs'
                );
                documents = Array.isArray(res.documents) ? res.documents : [];
                maxPage = res.total;

                if (loadMore)
                    documents = [...(collection.documents || []), ...documents];

            }

            const newSatates = {
                ...collection,
                page,
                documents,
                states,
                maxPage,
                loading: 0
            }

            setTimeout(async () => {
                setColStates(newSatates);
            }, 1000);


        } catch (e) {
            setColStates({
                ...collection,
                loading: 0,
                error: 1,
            });
        } finally {

        }
    }



    useEffect(() => {


        if (filters.length <= 0 && !isFilterChange)
            return;

        //debounce((colStates) => {
        setColStates({ ...colStates, loading: 1, error: 0 });

        laodDocumnents(colStates);
        // }, 500);

        setFilters(false);


    }, [states, _states])

    const onScroll = (onScroll, iframeDocument) => {

        if (!onScroll)
            return;


        const scrollTop = iframeDocument.pageYOffset;
        const scrollLeft = iframeDocument.pageXOffset;
        const delta = onScroll.delta;

        if (onScroll?.valueX || onScroll?.valueY) {

            let valueX = '';

            if (onScroll?.valueX) {
                valueX = onScroll.valueX.replace(/\[left]/g, scrollLeft);

                valueX = valueX.replace(/\[top]/g, scrollTop);
                valueX = valueX.replace(/\[delta]/g, delta);
            }

            let valueY = '';
            if (onScroll?.valueY) {
                valueY = onScroll.valueY?.replace(/\[top]/g, scrollTop);
                valueY = valueY.replace(/\[left]/g, scrollLeft);
                valueY = valueY.replace(/\[delta]/g, delta);
            }


            try {
                valueX = eval(valueX);
                valueY = eval(valueY);



            } catch (e) {
                message.error("Invalid expression:" + e?.message);

            }

            onChange([{ elem: onScroll.stateValueX || {}, value: valueX }, { elem: onScroll.stateValueY || {}, value: valueY }], node, null);
        }

    }



    useEffect(() => {
        if (!events) return;

        const iframe = document.querySelector("#ac-editor-iframe-doc");

        const handleScroll = (e) => {
            e.preventDefault();
            for (const key in events) {
                onScroll(events[key], iframe.contentWindow);
            }
        };

        if (iframe) {
            const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
            iframeDocument.addEventListener('scroll', handleScroll);
        }

        return () => {
            const iframe = document.querySelector("#ac-editor-iframe-doc");
            if (iframe) {
                const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                iframeDocument.removeEventListener('scroll', handleScroll);
            }
        };
    }, [events]);




    const setValue = useCallback(async (elem, value, withValue) => {
        const type = elem.type;
        const key = elem.key;

        const isFilterKey = Object.values(colStates.filters || {}).some(filter => {
            return (
                filter.triggerType === type && // Check if triggerType matches
                filter.triggerKey.some(trigger => key.includes(trigger)) // Check for intersection
            );
        });


        setFilters(isFilterKey);

        switch (type) {
            case 'PROPS':
                updateStateValue(elem, withValue, _states, value);
                _setStates({ ..._states });
            case 'STATES':

                updateStateValue(elem, withValue, states, value);
                setStates({ ...states });
            case 'COLSTATES':
                if (key[0] === 'page') {

                    if (isNaN(value) || isNaN(withValue))
                        value = colStates.page;

                    const totalPages = Math.ceil(colStates.maxPage / colStates.limit);
                    const page = { max: totalPages, min: 1, defaultValue: colStates.page }
                    updateStateValue(elem, withValue, { page }, value);

                    if (colStates.page === page.defaultValue)
                        return;

                    if (colStates.loadMore) {

                        if (Math.abs(colStates.page - page.defaultValue) > 1) {
                            return;
                        }

                        if (colStates.page < page.defaultValue) {
                            setColStates({ ...colStates, loading: 1, error: 0 });

                            await laodDocumnents({ ...colStates, page: page.defaultValue });
                        } else if (colStates.page > page.defaultValue - 1) {
                            const documents = colStates.documents.slice(0, -(colStates.limit || 1))
                            setColStates({ ...colStates, page: page.defaultValue, documents })
                        }


                    } else {
                        setColStates({ ...colStates, loading: 1, error: 0 });
                        await laodDocumnents({ ...colStates, page: page.defaultValue });

                    }

                }

            case 'FORMSTATES':
                if (states[key[0]]) {
                    states[key[0]][key[1]] = value
                    setStates({ ...states });
                }
            default:
        }


    }, [states, colStates, _states])

    const onSetStates = useCallback(async (key, value, type) => {

        switch (type) {
            case 'PROPS':
                const prop = getStateRef(key, _states)
                if (prop) {
                    prop.defaultValue = value
                    _setStates({ ..._states });
                }
            case 'STATES':
                const state = getStateRef(key, states)
                if (state) {
                    state.defaultValue = value
                    setStates({ ...states });
                }
            default:

        }

    }, [states, _states])

    const onClick = useCallback((node, stateValue, withValue) => {

        //const node = await getData(_id, id);
        if (node && node.onClick) {
            const onclick = node.onClick;
            setValue(onclick, stateValue?.value || stateValue, withValue?.value || withValue);
        }

    }, [states, colStates, _states])


    const onChange = useCallback(async (values, node, all = false) => {

        //const node = await getData(_id, id);
        let allvalues = '';
        if (all) {
            let options = [];

            if (node.options) {
                options = node.options.split(",");
                options = Object.values(options).map((val) => val.split(":")[0]);
            }

            if (node.map) {
                let statesRef = {};
                const maKey = node.map.key;
                const mapType = node.map.type;


                if (mapType == 'STATES')
                    statesRef = getStateRef(maKey, states);
                else
                    if (mapType == 'PROPS')
                        statesRef = getStateRef(maKey, _states);
                if (mapType == 'COLSTATES') {
                    statesRef.states = {};

                    if (maKey[0] === 'DOCUMENTS' && colStates.documents) {


                        statesRef.states = colStates.documents.reduce((result, doc, idx) => {
                            result[idx] = { value: doc._id + ":" + doc.name, idx };
                            return result;
                        }, {});



                    } else
                        if (maKey[0] === 'RELATIONSHIPS' && colStates.populatedRelationships) {
                            const docs = colStates.populatedRelationships[maKey[1]];

                            if (docs)
                                statesRef.states = docs.reduce((result, rel, idx) => {
                                    result[idx] = { value: rel._id + ":" + rel.name, idx };
                                    return result;
                                }, {});
                        } else if (maKey[0] === 'PAGES') {

                            const totalPages = Math.ceil(colStates.maxPage / colStates.limit);
                            const pageArray = Array.from({ length: totalPages }, (_, index) => index + 1);

                            if (pageArray.length > 0)
                                statesRef.states = pageArray.reduce((result, index, idx) => {
                                    result[idx] = { value: index, idx };
                                    return result;
                                }, {});
                        }
                }


                if (statesRef && statesRef.states) {
                    const states = Object.values(statesRef.states).map((val) => val.value.split(":")[0]);
                    options = [...(new Set([...options, ...states]))];

                }
            }


            allvalues = options;

        }


        for (const elem of values) {

            let value = elem.value;
            const onChange = elem.elem;

            if (value === 'all')
                value = allvalues.join(",");

            setValue(onChange, value, '');
        }

        return allvalues;


    }, [states, colStates, _states])



    const onSubmit = useCallback((states) => {
        setStates({ ...states });
    }, [states])


    return <> {loading ?
        <InlineSkeleton />
        :
        <ElementMapping {...props} map={node.map}
            _states={states}
            _props={_states}
            disabled={component.disabled}>

            {React.Children.map(children, (child, index) => {
                return child && React.cloneElement(child, {
                    key: child.props?._uid,
                    fun: {
                        onChange,
                        onClick,
                        onSubmit
                    },
                    disabled: component.disabled,
                    _id: component._id,
                    _states: states,
                    _props: _states,
                    onSetStates: onSetStates,
                    _setStates: setStates,
                    colStates: colStates
                })
            })}
        </ElementMapping>}
    </>



};


export default Component;