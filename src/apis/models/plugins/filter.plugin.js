const { ObjectId } = require("mongodb");

const filter = function (schema) {
    schema.statics.filterDocuments = async function (docIds, relationships, collections = []) {
        const res = await this.aggregate([
            {
                $facet: {
                    documents: [
                        {
                            $match: {
                                _id: {
                                    $in: docIds.map(id => new ObjectId(id))
                                }
                            }
                        },
                        ...collections.map((collection) => ({
                            $lookup: {
                                from: collection.collectionName,
                                let: { localFieldValue: `$${collection.localField}` },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $cond: {
                                                    if: { $isArray: `$${collection.localField}` },
                                                    then: { $in: [`$${collection.foreignField}`, `$$localFieldValue`] },
                                                    else: { $eq: [`$${collection.foreignField}`, `$$localFieldValue`] }
                                                }
                                            }
                                        },
                                    },
                                    { $project: collection.projection } // Add the projection for the $lookup here
                                ],
                                as: collection.as
                            }
                        })),
                        ...(Array.isArray(relationships)
                            ? relationships.map((rel, i) => ({
                                $lookup: {
                                    from: rel.collectionName,
                                    let: { localFieldValue: `$${rel.localField}` },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {

                                                    $in: [`$${rel.foreignField}`, { $map: { input: `$$localFieldValue`, as: 'id', in: { $toObjectId: '$$id' } } }]
                                                }
                                            },
                                        },
                                        { $project: rel.projection }
                                    ],

                                    as: rel.as
                                }
                            })

                            )
                            : []),
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                states: 1,
                                setting: 1,
                                creator: 1,
                                createdAt: 1,
                                ...collections.reduce((acc, collection) => {
                                    acc[collection.as] = 1;
                                    return acc;
                                }, {}),
                                populatedRelationships: 1

                            }
                        },
                        { $skip: (pageNumber - 1) * pageSize },
                        { $limit: pageSize }
                    ]
                }
            },
            {
                $project: {
                    documents: 1,
                    total: { $size: "$documents" }
                }
            }
        ]);

        return { documents: res[0].documents, total: res[0].total };



    };

    schema.statics.filterAllDocuments = async function (filters, relationships, filter, options, collections = []) {

        let sort = {};

        if (options.sortBy) {
            sort = options.sortBy.split(',').reduce((acc, sortOption) => {
                const [key, order] = sortOption.split(':');
                acc[key] = order === 'desc' ? -1 : 1;
                return acc;
            }, {});
        } else {
            sort.createdAt = 1;
        }

        const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10
        const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1
        const skip = (page - 1) * limit;

        let search = ''
        if (filter?.name) {
            search = { $regex: new RegExp(filter.name, 'i') };
        }

        const res = await this.aggregate([
            {
                $facet: {
                    documents: [
                        {
                            $match: {
                                ...(search && { name: search }),
                                ...filters.reduce((criteria, filter) => {

                                    if (!filter.defaultValue) return {};

                                    if (filter.filterKey[0] === 'STATES') {

                                        criteria[`states.${filter.filterKey[1]}.defaultValue`] = {
                                            $regex: filter.defaultValue ?? '',
                                            $options: 'i'
                                        };
                                    }
                                    else

                                        if (filter.filterKey[0] === 'RELATIONSHIPS') {
                                            const values = Array.isArray(filter.defaultValue) ? filter.defaultValue : [filter.defaultValue]

                                            criteria[`relationships.${filter.filterKey[1]}`] = {
                                                $in: values.map(id => id)
                                            }


                                        } else
                                            if (filter.filterKey[0] === '_id')
                                                criteria._id = new ObjectId(filter.defaultValue)
                                            else
                                                criteria[filter.filterKey[0]] = { $regex: filter.defaultValue + '', $options: 'i' }

                                    return criteria;
                                }, {})
                            }
                        },
                        ...collections.map((collection) => ({
                            $lookup: {
                                from: collection.collectionName,
                                let: { localFieldValue: `$${collection.localField}` },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $cond: {
                                                    if: { $isArray: `$${collection.localField}` },
                                                    then: { $in: [`$${collection.foreignField}`, `$$localFieldValue`] },
                                                    else: { $eq: [`$${collection.foreignField}`, `$$localFieldValue`] }
                                                }
                                            }
                                        },
                                    },
                                    { $project: collection.projection } // Add the projection for the $lookup here
                                ],
                                as: collection.as
                            }
                        })),
                        ...(Array.isArray(relationships)
                            ? relationships.map((rel, i) => ({
                                $lookup: {
                                    from: rel.collectionName,
                                    let: { localFieldValue: `$${rel.localField}` },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $in: [`$${rel.foreignField}`, { $map: { input: `$$localFieldValue`, as: 'id', in: { $toObjectId: '$$id' } } }]
                                                }
                                            },
                                        },
                                        { $project: rel.projection }
                                    ],
                                    as: rel.as
                                }
                            })

                            )
                            : []),
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                slug: 1,
                                url: 1,
                                states: 1,
                                setting: 1,
                                creator: 1,
                                createdAt: 1,
                                ...collections.reduce((acc, collection) => {
                                    acc[collection.as] = 1;
                                    return acc;
                                }, {}),
                                populatedRelationships: 1
                            }
                        },
                        { $sort: sort },
                        { $skip: skip },
                        { $limit: limit },

                    ],
                    total: [
                        { $count: 'total' }
                    ]
                }

            }
        ]);


        return { documents: res[0].documents, total: res[0].total[0]?.total || 0 };


    };



};

module.exports = filter;