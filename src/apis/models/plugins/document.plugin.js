const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

function generateRandomString(length) {
  const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
  return randomBytes.toString('hex').slice(0, length);
}

const getStyle = async (child) => {
  const style = {};
  for (const key of Object.keys(child.style)) {
    if (child.style[key]) {
      for (const ruleKey of Object.keys(child.style[key])) {
        if (Object.hasOwnProperty.call(child.style[key], ruleKey)) {
          // Check if the ruleKey contains :hover, ::before, or ::after selector
          const hasHoverSelector = /:hover/.test(ruleKey);
          const hasBeforeSelector = /::before/.test(ruleKey);
          const hasAfterSelector = /::after/.test(ruleKey);

          // Update the selectorText based on the presence of :hover, ::before, or ::after selector
          let selectorText = child.selector;
          if (hasHoverSelector) {
            selectorText += ":hover";
          } else if (hasBeforeSelector) {
            selectorText += "::before";
          } else if (hasAfterSelector) {
            selectorText += "::after";
          }

          if (!style[key]) {
            style[key] = {};
          }

          style[key][selectorText] = {
            ...child.style[key][ruleKey],
            selectorText,
          };
        }
      }
    }
  }
  return style;
};



const onCopyElements = async (elements, styles) => {

  for (const key in elements) {
    const id = generateRandomString(8);

    const mainClass = elements[key].mainClass || "ac" + "-elem";

    elements[key].className = mainClass + "-" + id;
    const selectors = elements[key].selector.split(" ");
    selectors[selectors.length - 1] = "." + mainClass + "-" + id;
    elements[key].selector = selectors.join(" ");

    const styleUid = elements[key].styleUid;

    if (styles[styleUid])
      styles[styleUid].selectorText = elements[key].selector

  }

};

const document = function (schema) {
  schema.statics.document = async function (id, collections, projection = { name: 1 }) {

    const lookups = collections.map((collection) => ({
      $lookup: {
        from: collection.collectionName,
        let: { localFieldValue: `$${collection.localField}` },
        pipeline: [
          {
            $match: {
              $expr: {
                $cond: {
                  if: { $isArray: `$${collection.localField}` },
                  then: { $in: [`$${collection.foreignField}`, { $map: { input: `$$localFieldValue`, as: 'id', in: { $toObjectId: '$$id' } } }] },
                  else: { $eq: [`$${collection.foreignField}`, `$$localFieldValue`] }
                }
              }
            },
          },
          { $project: collection.projection } // Add the projection for the $lookup here
        ],
        as: collection.as
      }
    }))

    const doc = await this.aggregate([
      { $match: { _id: new ObjectId(id) } },
      { $project: projection },
      ...lookups
    ]);



    return doc[0];
  };

  schema.statics.duplicate = async function (id, name) {
    const doc = await this.findById(id);

    if (!doc) {
      throw new Error(`${name} not found`);
    }


    const uniqueId = uuidv4().substring(0, 6);
    const duplicatedDoc = doc.toObject();
    delete duplicatedDoc._id;

    if (duplicatedDoc.slug) {
      const name = duplicatedDoc.name.toLowerCase().replace(/\s+/g, "_");

      duplicatedDoc.slug = 'copy' + `_${name}` + `_${uniqueId}`
      duplicatedDoc.url = `/${duplicatedDoc.slug}`
    }

    if (duplicatedDoc.elements)
      await onCopyElements(duplicatedDoc.elements, duplicatedDoc.styles)

    duplicatedDoc.duplicated = true;
    return this.create(duplicatedDoc);

  };

};

module.exports = document;