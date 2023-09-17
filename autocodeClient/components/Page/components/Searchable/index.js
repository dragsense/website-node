import React, { useState, useEffect, useRef, useMemo } from 'react';

//import ProjectServices from "../../../../../../lib/services/projects"

const Searchable =
    (props) => {
        const {
            children,
            element,
            node,
            states,
            updateStates
        } = props;


        const limit = states['limit'] ? states['limit'].defaultValue || 10 : 10;
        const search = states['search'] ? states['search'].defaultValue : '';

        const total = states['total'] ? states['total'].defaultValue : 0;
        const activeIndex = states['currentIndex'] ? states['currentIndex'].defaultValue : 1;

        useEffect(() => {

            const loadResults = async () => {
                try {


            
                    // const res = await ProjectServices.search(search, activeIndex, limit);
                    // const results = Array.isArray(res.results) ? res.results : [];
                    // const maxPage = res.total;
                    // updateStates('pages', results, 'states');
                    // updateStates('items', maxPage);


                } catch (e) {
                    console.log(e?.message || "Something went wrong.")
                }
            }

            loadResults();

        }, [activeIndex, search]);


        const searchableItem = useMemo(
            () => element(
                node,
                children
            ),
            [children]
        );

        return searchableItem;

    };

export default Searchable;