

import React, { useEffect, useState, useMemo, useCallback } from "react";
import ElementMapping from './ElementMapping';


import DocumentServices from '../../libs/services/documnets';

import { getStateValue, updateStateValue, getStateRef } from '../../utils/element-value';

const Component = (props) => {

    const { component, node, _states, _setStates, children, pages } = props;

    const comp = pages[component._id];

    if(!comp)
    return null;



    const [states, setStates] = useState(comp.states);
    const [colStates, setColStates] = useState({ ...comp.collStates, loading: 0 });
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


            // if (key[0] == '__relationship__')
            //     defaultValue = filter.defaultRelationshipsFilter?.map(val => val._id);

            return { filterKey: [filter.type, ...filter.filterKey], defaultValue: defaultValue || '' }
        }
        )


        return _filters;

    }, [colStates.filters]);


    const laodDocumnents = async (collection) => {

        if(!collection._id)
        return;

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
            setColStates({ ...collection, loading: 1 });


            if (Array.isArray(docs) && docs?.length > 0) {
                const res = await DocumentServices.getFilteredDocuments(collectionId, { documentIds: docs.map(doc => doc._id), selectedRelationships, withRelationship });

                documents = Array.isArray(res?.documents) ? res.documents : [];
                maxPage = res?.total || 0;

            }
            else {


                const res = await DocumentServices.getAllFilteredDocuments(collectionId,
                    { filters, withRelationship, selectedRelationships },
                    parseInt(page || 1),
                    parseInt(limit || 25),
                    sortBy || 'createdAt',
                    sort || 'acs'
                );
                documents = Array.isArray(res?.documents) ? res.documents : [];
                maxPage = res?.total || 0;

                if (loadMore)
                    documents = [...collection.documents, ...documents];

            }


            setColStates({
                ...collection,
                documents,
                states,
                maxPage,
                loading: 0
            });


        } catch (e) {
            console.log(e?.message)
        } finally {
        }
    }



    useEffect(() => {
        laodDocumnents(colStates);
    }, [])




   
    useEffect(() => {


        if (filters.length <= 0 && !isFilterChange)
            return;

        //debounce((colStates) => {
        setColStates({ ...colStates, loading: 0 });

        laodDocumnents(colStates);
        // }, 500);

        setFilters(false);


    }, [states])



    const setValue = async (elem, value, withValue) => {
        const type = elem.type;
        const key = elem.key;


        const isFilterKey = Object.values(colStates.filters).some(filter => filter.triggerKey === key && filter.triggerType === type);
        setFilters(isFilterKey);

        switch (type) {
            case 'PROPS':
                updateStateValue(elem, withValue, _states, value);
                _setStates({ ..._states });
            case 'STATES':
                updateStateValue(elem, withValue, states, value);
                setStates({ ...states });
            case 'COLLECTION':

                if (key[0] === 'page') {

                    if (isNaN(value))
                        value = colStates.page;

                    const totalPages = Math.ceil(colStates.maxPage / colStates.limit);



                    if (!colStates.loadMore) {
                        const page = { max: totalPages + 1, min: 1, defaultValue: colStates.page }

                        updateStateValue({ key, value: "[withvalue]+[value]" }, withValue, { page }, value);

                        if (page.defaultValue >= totalPages + 1)
                            return;

                        laodDocumnents({ ...colStates, page: page.defaultValue });
                    }
                }

            case 'FORMSTATES':

                if (states[key[0]]) {
                    states[key[0]][key[1]] = value
                    setStates({ ...states });
                }
            default:
                return;
        }

    }

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

    const onClick = useCallback(async (node, stateValue, withValue) => {

        //const node = await getData(_id, id);
        if (node && node.onClick) {
            const onclick = node.onClick;
            setValue(onclick, stateValue?.value || stateValue, withValue?.value || withValue);
        }

    }, [states, colStates])

    const onChange = useCallback(async (node, value, all = false) => {

        //const node = await getData(_id, id);
        setValue(node.onChange, value, '');

        if (node && node.state) {


            if (all && node.map) {

                if (value.includes('all')) {
                    const maKey = node.map.key;
                    const mapType = node.map.type;
                    let map = null;
                    if (mapType == 'STATES')
                        map = getStateRef(maKey, states);
                    else
                        map = getStateRef(maKey, states);

                    if (map) {
                        const states = Object.values(map.states).map((val) => val.split(":")[0]);
                        let options = node.options.split(",");
                        options = Object.values(options).map((val) => val.split(":")[0]);
                        value = [...(new Set([...options, ...states]))].join(',');

                    }
                } else
                    value = ''
            }


        }

    }, [states])


    const onSubmit = useCallback((states) => {
        setStates({ ...states });
    }, [states])


    return <div data-name={`${component.disabled ? 'disabled-' : ''}component`}>
        <ElementMapping {...props} map={node.map}>

            {React.Children.map(children, (child) => {
                return child && React.cloneElement(child, {
                    onChange: onChange,
                    onClick: onClick,
                    onSubmit: onSubmit,
                    _id: component._id,
                    _states: states,
                    _props: _states,
                    onUpdateStates: onSetStates,
                    _setStates: setStates,
                    colStates: colStates
                })
            })}
        </ElementMapping>
    </div>



};


export default Component;