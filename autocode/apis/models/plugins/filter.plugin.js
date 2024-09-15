const { ObjectId } = require('mongodb')

// Helper function to handle errors
const handleError = (error) => {
    console.error(error)
    throw new Error('An error occurred while processing your request.')
}

const filter = function (schema) {
    // Function to create sort object from options
    const createSortObject = (options) => {
        let sort = {}
        if (options.sortBy) {
            sort = options.sortBy.split(',').reduce((acc, sortOption) => {
                const [key, order] = sortOption.split(':')
                acc[key] = order === 'desc' ? -1 : 1
                return acc
            }, {})
        } else {
            sort.createdAt = 1
        }
        return sort
    }

    // Function to create pagination parameters
    const createPaginationParameters = (options) => {
        const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10
        const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1
        const skip = (page - 1) * limit
        return { limit, skip }
    }

    const isValidObjectId = (id) => {
        return /^[a-fA-F0-9]{24}$/.test(id)
    }

    // Function to create filter criteria
    const createFilterCriteria = (filters) => {
        return filters.reduce((criteria, filter) => {
            if (!filter.defaultValue) return criteria

            if (filter.filterKey[0] === 'STATES') {
                criteria[`states.${filter.filterKey[1]}.defaultValue`] = {
                    $regex: filter.defaultValue ?? '',
                    $options: 'i',
                }
            } else if (filter.filterKey[0] === 'RELATIONSHIPS') {
                const values = Array.isArray(filter.defaultValue) ? filter.defaultValue : filter.defaultValue.split(',')
                criteria[`relationships.${filter.filterKey[1]}`] = {
                    $in: values.filter((id) => isValidObjectId(id)).map((id) => new ObjectId(id)),
                }
            } else if (filter.filterKey[0] === '_id') {
                criteria._id = isValidObjectId(filter.defaultValue) ? new ObjectId(filter.defaultValue) : filter.defaultValue
            } else {
                criteria[filter.filterKey[0]] = { $regex: filter.defaultValue + '', $options: 'i' }
            }

            return criteria
        }, {})
    }

    schema.statics.filterDocuments = async function (docIds, filters, relationships, collections = [], options) {
        try {
            // Create sort object
            const sort = createSortObject(options)

            // Create pagination parameters
            const { limit, skip } = createPaginationParameters(options)

            // Create filter criteria
            const filterCriteria = createFilterCriteria(filters)

            let search = ''
            if (filter?.name) {
                search = { $regex: new RegExp(filter.name, 'i') }
            }

            let status = filter?.status

            const res = await this.aggregate([
                {
                    $facet: {
                        documents: [
                            {
                                $match: {
                                    ...(status && { 'setting.status': status }),
                                    ...(search && { name: search }),
                                    _id: {
                                        $in: docIds.map((id) => new ObjectId(id)),
                                    },
                                    ...filterCriteria,
                                },
                            },
                            {
                                $lookup: {
                                    from: 'ac_medias',
                                    localField: 'setting.image',
                                    foreignField: '_id',
                                    as: 'setting.populatedImage',
                                    pipeline: [
                                        {
                                            $project: { src: 1, _id: 1, alt: 1 },
                                        },
                                    ],
                                },
                            },
                            {
                                $unwind: {
                                    path: '$setting.populatedImage',
                                    preserveNullAndEmptyArrays: true,
                                },
                            },
                            ...(Array.isArray(relationships)
                                ? relationships.map((rel, i) => ({
                                      $lookup: {
                                          from: rel.collectionName,
                                          localField: rel.localField,
                                          foreignField: rel.foreignField,
                                          as: rel.as,
                                          pipeline: [
                                              { $project: rel.projection },
                                              {
                                                  $lookup: {
                                                      from: 'ac_medias',
                                                      localField: 'setting.image',
                                                      foreignField: '_id',
                                                      as: 'setting.populatedImage',
                                                      pipeline: [
                                                          {
                                                              $project: { src: 1, _id: 1, alt: 1 },
                                                          },
                                                      ],
                                                  },
                                              },
                                              {
                                                  $unwind: {
                                                      path: '$setting.populatedImage',
                                                      preserveNullAndEmptyArrays: true,
                                                  },
                                              },
                                          ],
                                      },
                                  }))
                                : []),
                            {
                                $project: {
                                    _id: 1,
                                    name: 1,
                                    states: 1,
                                    setting: 1,
                                    creator: 1,
                                    createdAt: 1,

                                    populatedRelationships: 1,
                                },
                            },
                            { $sort: sort },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                    },
                },
                {
                    $project: {
                        documents: 1,
                        total: { $size: '$documents' },
                    },
                },
            ])

            return { documents: res[0].documents, total: res[0].total }
        } catch (error) {
            handleError(error)
        }
    }

    schema.statics.filterAllDocuments = async function (filters, relationships, filter, options, collections = []) {
        try {
            let search = null
            if (filter?.name) {
                search = { $regex: new RegExp(filter.name, 'i') }
            }

            let status = filter?.status ? filter?.status : null;

            let createdAt = null
            if (filter?.startDate && filter?.endDate) {
                createdAt = { $gte: new Date(filter.startDate), $lte: new Date( filter.endDate) }
            }

            // Create sort object
            const sort = createSortObject(options)

            // Create pagination parameters
            const { limit, skip } = createPaginationParameters(options)

            // Create filter criteria
            const filterCriteria = createFilterCriteria(filters)


            const res = await this.aggregate([
                {
                    $facet: {
                        documents: [
                            {
                                $match: {
                                    ...(status && { 'setting.status': status }),
                                    ...(search && { name: search }),
                                    ...(createdAt && { createdAt }),
                                    ...filterCriteria,
                                },
                            },
                            {
                                $lookup: {
                                    from: 'ac_medias',
                                    localField: 'setting.image',
                                    foreignField: '_id',
                                    as: 'setting.populatedImage',
                                    pipeline: [
                                        {
                                            $project: { src: 1, _id: 1, alt: 1 },
                                        },
                                    ],
                                },
                            },
                            {
                                $unwind: {
                                    path: '$setting.populatedImage',
                                    preserveNullAndEmptyArrays: true,
                                },
                            },
                            ...(Array.isArray(relationships)
                                ? relationships.map((rel, i) => ({
                                      $lookup: {
                                          from: rel.collectionName,
                                          localField: rel.localField,
                                          foreignField: rel.foreignField,
                                          as: rel.as,
                                          pipeline: [
                                              { $project: rel.projection },
                                              {
                                                  $lookup: {
                                                      from: 'ac_medias',
                                                      localField: 'setting.image',
                                                      foreignField: '_id',
                                                      as: 'setting.populatedImage',
                                                      pipeline: [
                                                          {
                                                              $project: { src: 1, _id: 1, alt: 1 },
                                                          },
                                                      ],
                                                  },
                                              },
                                              {
                                                  $unwind: {
                                                      path: '$setting.populatedImage',
                                                      preserveNullAndEmptyArrays: true,
                                                  },
                                              },
                                          ],
                                      },
                                  }))
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

                                    populatedRelationships: 1,
                                },
                            },
                            { $sort: sort },
                            { $skip: skip },
                            { $limit: limit },
                        ],
                        total: [
                            {
                                $match: {
                                    ...(status && { 'setting.status': status }),
                                    ...(search && { name: search }),
                                    ...(createdAt && { createdAt }),
                                    ...filterCriteria,
                                },
                            },
                            { $count: 'total' },
                        ],
                    },
                },
            ])

            return { documents: res[0].documents, total: res[0].total[0]?.total || 0 }
        } catch (error) {
            handleError(error)
        }
    }
}

module.exports = filter
