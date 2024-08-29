// Importing required modules
const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

function generateRandomString(length) {
  try {
    const randomBytes = crypto.randomBytes(Math.ceil(length / 2));
    return randomBytes.toString('hex').slice(0, length);
  } catch (error) {
    console.error(`Error generating random string: ${error}`);
    return null;
  }
}

const getStyle = async (child) => {
  try {
    const style = {};
    // Iterating over each style key of the child
    for (const key of Object.keys(child.style)) {
      if (child.style[key]) {
        // Iterating over each rule key of the style
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

            // If the style key does not exist, initialize it
            if (!style[key]) {
              style[key] = {};
            }

            // Update the style key with the selector text and its rules
            style[key][selectorText] = {
              ...child.style[key][ruleKey],
              selectorText,
            };
          }
        }
      }
    }
    // Return the updated style
    return style;
  } catch (error) {
    console.error(`Error getting style: ${error}`);
    return null;
  }
};


const onCopyElements = async (elements, styles) => {
  try {
    // Iterating over each element
    for (const key in elements) {
      const id = generateRandomString(8);

      const mainClass = elements[key].mainClass || "ac" + "-elem";

      // Updating the className and selector of the element
      elements[key].className = mainClass + "-" + id;
      const selectors = elements[key].selector.split(" ");
      selectors[selectors.length - 1] = "." + mainClass + "-" + id;
      elements[key].selector = selectors.join(" ");

      const styleUid = elements[key].styleUid;

      // Updating the selectorText of the style
      if (styles[styleUid])
        styles[styleUid].selectorText = elements[key].selector

    }
  } catch (error) {
    console.error(`Error copying elements: ${error}`);
  }
};

const document = function (schema) {
  schema.statics.document = async function (id, collections, projection = { name: 1 }) {

    const lookups = collections.map((collection) => ({
      $lookup: {
        from: collection.collectionName,
        localField: collection.localField,
        foreignField: collection.foreignField,
        as: collection.as,
        pipeline: [
          { $project: collection.projection },
          {
            $lookup: {
              from: 'ac_medias',
              localField: 'setting.image',
              foreignField: '_id',
              as: 'setting.populatedImage',
              pipeline: [
                {
                  $project: { src: 1, _id: 1, alt: 1 }
                },
              ]
            }
          },
          {
            $unwind: {
              path: '$setting.populatedImage',
              preserveNullAndEmptyArrays: true

            }
          }
        ]
      }
    }))

    // Fetching the document from the database
    try {
      const doc = await this.aggregate([
        { $match: { _id: new ObjectId(id) } },
        { $project: projection },
   
        ...lookups,
        {
          $unwind: {
            path: '$setting.populatedImage',
            preserveNullAndEmptyArrays: true

          }
        },
      ]);

      if (!doc || doc.length === 0) {
        throw new Error('Document not found');
      }

      return doc[0];
    } catch (error) {
      console.error(`Error fetching document: ${error}`);
      return null;
    }
  };

  schema.statics.duplicate = async function (id, name) {
    try {
      const doc = await this.findById(id);

      if (!doc) {
        throw new Error(`${name} not found`);
      }

      const uniqueId = uuidv4().substring(0, 6);
      const duplicatedDoc = doc.toObject();
      delete duplicatedDoc._id;

      // Updating the slug of the duplicated document
      if (duplicatedDoc.slug) {
        const name = duplicatedDoc.name.toLowerCase().replace(/\s+/g, "_");
        duplicatedDoc.slug = 'copy' + `_${name}` + `_${uniqueId}`
      }

      // Updating the elements and styles of the duplicated document
      if (duplicatedDoc.elements)
        await onCopyElements(duplicatedDoc.elements, duplicatedDoc.styles)

      duplicatedDoc.duplicated = true;
      return this.create(duplicatedDoc);
    } catch (error) {
      console.error(`Error duplicating document: ${error}`);
      return null;
    }
  };

};

// Exporting the document function
module.exports = document;