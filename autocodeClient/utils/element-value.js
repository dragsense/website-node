import { formatDate } from './utils';

export const getStateValue = (key, states) => {
  let defaultValue = "";

  try {
    if (!states || !states[key[0]]) return defaultValue;

    let stateRef = states[key[0]];

    switch (stateRef.type) {
      case 'image':
        defaultValue = {
          value: stateRef.src?.src || './images/default/default-img.png',
          label: stateRef.src?.alt || 'image'
        };
        break;
      case 'video':
        defaultValue = {
          value: stateRef.src?.src || './images/default/default-poster.png',
          label: stateRef.src?.alt || 'video',
          srcs: stateRef.srcs
        };
        break;
      case 'audio':
        defaultValue = {
          value: './audios/default/sample.mp3',
          srcs: stateRef.srcs
        };
        break;
      case 'images':
        if (key[1] && stateRef.states) {
          const index = Number(key[1]) || -1;
          if (stateRef.states[index]) {
            const value = stateRef.states[index];
            defaultValue = {
              value: value.src || './images/default/default-img.png',
              label: value.alt || 'image'
            };
          }
        }
        break;
      case 'array':
        if (key[1] && stateRef.states) {
          const index = Number(key[1]) || -1;
          if (stateRef.states[index]) {
            const value = stateRef.states[index].value?.split(":");
            defaultValue = {
              value: value[0],
              label: value[1] || value[0]
            };
          }
        }
        break;
      case 'object':
        defaultValue = getStateValue([key[1]], stateRef.states);
        break;
      default:
        defaultValue = stateRef.defaultValue || "";
    }
  } catch (e) {
    console.error("Some thing went wrong.");
  }

  return defaultValue;
}

export const getStateStates = (key, states) => {
  let values = [];

  try {
    if (!states || !states[key[0]]) return values;

    const value = states[key[0]];

    if (value.type === 'array') {
      values = Object.values(value.states).flatMap((value, index) => {
        const val = value.value.split(":");
        return { label: val[0], value: val[1] || value.idx, key: val[1] || value.id };
      });
    }

    if (value.type === 'images') {
      values = Object.values(value.states).map((value) => {
        return { label: value.alt, value: value.src, key: value._id };
      });
    }
  } catch (e) {
    console.error("Some thing went wrong.");
  }

  return values;
}

export const getStateRef = (key, states) => {
  if (!states || !states[key[0]]) return undefined;

  let value = states[key[0]];

  if (value.type === 'array' || value.type === 'images') return undefined;

  if (value.type === 'object' && value.states) value = value.states[key[1]];

  return value;
}

export const getStates = (key, states) => {
  let defaultValue = "";

  try {
    if (!states || !states[key[0]]) return defaultValue;

    let stateRef = states[key[0]];

    switch (stateRef.type) {
      case 'image':
        defaultValue = {
          value: stateRef.src?.src || './images/default/default-img.png',
          label: stateRef.src?.alt || 'image'
        };
        break;
      case 'video':
        defaultValue = {
          value: stateRef.src?.src || './images/default/default-poster.png',
          label: stateRef.src?.alt || 'video',
          srcs: stateRef.srcs
        };
        break;
      case 'audio':
        defaultValue = {
          value: './audios/default/sample.mp3',
          srcs: stateRef.srcs
        };
        break;
      case 'images':
        if (key[1] && stateRef.states) {
          const index = Number(key[1]) || -1;
          if (stateRef.states[index]) {
            const value = stateRef.states[index];
            defaultValue = {
              value: value.src || './images/default/default-img.png',
              label: value.alt || 'image'
            };
          } else {
            defaultValue = Object.values(stateRef.states).map((value) => {
              return { label: value.alt, value: value.src, key: value._id };
            });
          }
        }
        break;
      case 'array':
        if (key[1] && stateRef.states) {
          const index = Number(key[1]) || -1;
          if (stateRef.states[index]) {
            const value = stateRef.states[index].value?.split(":");
            defaultValue = {
              value: value[0],
              label: value[1] || value[0]
            };
          } else {
            defaultValue = Object.values(stateRef.states).flatMap((value, index) => {
              const val = value.value.split(":");
              return { label: val[0], value: val[1] || value.idx, key: val[1] || value.id };
            });
          }
        }
        break;
      case 'object':
        defaultValue = getStateValue([key[1]], stateRef.states);
        break;
      default:
        defaultValue = stateRef.defaultValue || "";
    }
  } catch (e) {
    console.error("Some thing went wrong.");
  }

  return defaultValue;
}

export const updateStateValue = (elem, withValue, states, value, updateKey = "defaultValue") => {
  const key = elem.key;
  const expression = elem.value;

  let stateRef = getStateRef(key, states);

  if (!stateRef) return false;

  try {
    let val = '';

    if (expression) {
      let orignal = expression.replace(/\[withkey]/g, withValue);
      orignal = orignal.replace(/\[value]/g, value);
      orignal = orignal.replace(/\[key]/g, stateRef.defaultValue);

      val = eval(orignal);
    } else {
      val = value;
    }

    if (val >= stateRef.max && updateKey !== 'max') val = stateRef.max;
    else if (val <= stateRef.min && updateKey !== 'min') val = stateRef.min;

    stateRef[updateKey] = val;
  } catch (e) {
    console.error("Some thing went wrong.");
  }
}

export const generateCascader = (elementStates, type, value) => {
  const states = Object.values(elementStates).map(state => {
    let children = null;
    if (state.states) {
      state.type = state.type || 'array';
      children = Object.keys(state.states).map((key, index) => {
        return {
          label: key.toUpperCase(), value: key
        };
      });
    } else {
      children = undefined;
    }

    return {
      label: state.key.toUpperCase(), value: state.key, type: state.type, children
    };
  });

  return [{ label: type, value: value, type: type, children: states }];
}

export const generateCascaderCollStates = (elementStates, type, value) => {
  const states = Object.entries(elementStates).map(([key, value]) => {
    let children = null;
    const state = { key: key.toUpperCase(), value: key };
    if (key === 'documents') {
      state.type = 'array';
    }
    if (key === 'states') {
      return generateCascader(value, 'STATES', key)[0];
    }

    return {
      label: state.key.toUpperCase(), value: state.value, type: state.type, children
    };
  });

  return [{ label: type, value: value, type: type, children: states }];
}

export const defaultDoc = [
  { label: '_ID', value: '_id' },
  { label: 'NAME', value: 'name' },
  {
    label: 'SLUG', value: 'slug',
  },
  {
    label: 'URL', value: 'url',
  },
  {
    label: 'TITLE', value: 'title',
  },
  {
    label: 'DESC', value: 'desc',
  },
  {
    label: 'EXCERPT', value: 'excerpt',
  },
  {
    label: 'IMAGE', value: 'image',
  },
];

export const pageSetting = [{ label: '_ID', value: '_id' },
{ label: 'NAME', value: 'name' },
{
  label: 'SLUG', value: 'slug',
},
{
  label: 'CREATOR', value: 'creator',
},
{
  label: 'URL', value: 'url',
},
{
  label: 'CREATED AT', value: 'createdAt',
  children: [
    { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
    { label: "MM/DD/YYYY", value: "MM/DD/YYYY" },
    { label: "DD/MM/YYYY", value: "DD/MM/YYYY" },
    { label: "YYYY/MM/DD", value: "YYYY/MM/DD" },
    { label: "Month D, YYYY", value: "MMMM D, YYYY" },
    { label: "D MMM, YYYY", value: "D MMM, YYYY" },
    { label: "MMMM DD, YYYY", value: "MMMM DD, YYYY" },
    { label: "DD MMM, YYYY", value: "DD MMM, YYYY" },
  ]
},
{
  label: 'SETTING', value: 'SETTING',
  children: [
    {
      label: 'TITLE', value: 'title',
    },
    {
      label: 'DESC', value: 'desc',
    },
    {
      label: 'EXCERPT', value: 'excerpt',
    },
    {
      label: 'CONTENT', value: 'content',
    },
    {
      label: 'IMAGE', value: 'image',
    },
    {
      label: 'STATUS', value: 'status',
    }
  ]
}
];
export const generateCascadeRelationsStates = async (collection) => {
  let tempStates = [];
  let relStates = [];
  if (collection.populatedRelationships) {
    await Promise.all(collection.populatedRelationships.map(async (relation, idx) => {
      const current = generateCascader(
        relation.states || {},
        relation.name.toUpperCase(), relation._id);
      tempStates = [...tempStates, ...current];
    }));

    relStates = [
      {
        label: 'POPULATED', value: 'POPULATED',
        children: [...tempStates]
      },
      {
        type: 'array', label: 'RELATIONSHIPS', value: 'RELATIONSHIPS',
        children: collection.populatedRelationships.map((rel, idx) => {
          return {
            label: rel.name.toUpperCase(),
            value: rel._id,
            type: 'relations'
          };
        })
      },
      {
        type: 'array', label: 'PAGES', value: 'PAGES',
        children: [{ label: 'INDEX', value: 'index' }]
      },
    ];
  }

  return relStates;
}

export const getPaginationRange = (currentPage, totalPages, pagination) => {
  const leftRangeLength = pagination.leftRange || 1;
  const rightRangeLength = pagination.rightRange || 1;
  const rangeSize = pagination.nearRange || 2;
  const dots = pagination.dots || "...";

  let start = Math.max(currentPage - rangeSize, 1);
  let end = Math.min(currentPage + rangeSize, totalPages);

  if (start === 1) {
    end = Math.min(start + rangeSize * 2, totalPages);
  } else if (end === totalPages) {
    start = Math.max(end - rangeSize * 2, 1);
  }

  const leftRange = Array.from({length: leftRangeLength}, (_, i) => i + 1);
  const rightRange = Array.from({length: rightRangeLength}, (_, i) => totalPages - i);

  if (start > leftRangeLength + 1) {
    leftRange.push(dots);
  }

  if (end < totalPages - rightRangeLength) {
    rightRange.unshift(dots);
  }

  const nearbyRange = Array.from({length: end - start + 1}, (_, i) => start + i);

  return [...leftRange, ...nearbyRange, ...rightRange];
};

export const getPageValue = (key, setting) => {
  if (key[0] === 'POPULATED') key.shift();



  if (key[0] === 'states') {
    const modifiedKey = [...key];
    modifiedKey.shift();
    return getStateValue(modifiedKey, setting.states);
  }

  if (key[0] === 'RELATIONSHIPS' && setting.relationships) {
    return setting.relationships[key[1]] || null;
  }

  if (key[0] === 'SETTING') {
    const _setting = setting.setting;
    if (!_setting) return;

    if (key[1] === 'image') {
      const image = _setting["populatedImage"];
      return {
        value: image?.src || '/images/default/default-img.png',
        label: image?.alt || '[featured image]'
      }
    }

    if (key[1] === 'status') {
      const status = _setting[key[1]];
      return {
        value: status,
        label: status || '[page status]'
      }
    }

    return {
      value: key[1] === 'content' ? key[1] : _setting[key[1]],
      label: _setting[key[1]] || `[page ${key[1]}]`
    }
  }

  if (key[0] === 'creator') {
    const creator = setting[key[0]];
    return {
      value: creator?._id || '',
      label: creator?.name || 'Unknown'
    }
  }

  if (key[0] === 'createdAt') {
    const createdAt = setting[key[0]];
    return createdAt ? formatDate(createdAt, key[1]) : `[page ${key[1]}]`;
  }

  if (key[0] === "NEXTDOCUMNET" || key[0] === 'PREVDOCUMNET') {
    const doc = setting[key[0]];
    if (!doc) {
      return '';
    }

    if (key[1] === 'image') {
      const image = doc['image'];
      return {
        value: image?.src || '/images/default/default-img.png',
        label: image?.alt || 'Featured Image'
      }
    }

    return {
      value: doc[key[1]],
      label: doc[key[1]] || `[document ${key[1]}]`
    }
  }

  return {
    value: setting[key[0]],
    label: setting[key[0]] || `[page ${key[0]}]`
  }
}

export const getPageStates = (docs, type) => {
  return docs?.length > 0 ? docs.map((value) => ({
    type,
    label: value.name,
    value: value._id,
    key: value._id,
    ...value,
    setting: value.setting,
  })) : [{
    label: '[Relation]',
    value: '',
  }]
}

