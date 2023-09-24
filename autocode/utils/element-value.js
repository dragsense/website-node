

/**
 * Get the value of a state based on its key.
 * This function is used to retrieve the value of a state from a given states object.
 * It uses the key array to navigate through the nested states object.
 *
 * @param {string[]} key - The key to access the state.
 * @param {object} states - The states object.
 * @returns {any} - The value of the state.
 */
export const getStateValue = (key, states, host) => {
  try {
    // If states object is not provided, return an empty string
    if (!states) {
      return "";
    }

    // Get the reference to the state using the first element of the key array
    const stateRef = states[key[0]];

    // If the state reference is not found, return an empty string
    if (!stateRef) {
      return "";
    }

    // Depending on the type of the state, return the appropriate value
    switch (stateRef.type) {
      case 'image':
        return {
          value: stateRef.src ? host+stateRef.src.src : './images/default/default-img.png',
          label: stateRef.src?.alt || 'image'
        };

      case 'video':
        return {
          value: stateRef.src ? host+stateRef.src.src : './images/default/default-poster.png',
          label: stateRef.src?.alt || 'video',
          srcs: stateRef.srcs
        };

      case 'audio':
        return {
          value: './audios/default/sample.mp3',
          srcs: stateRef.srcs
        };

      case 'images':
        if (key[1] && stateRef.states) {
          const index = isNaN(Number(key[1])) ? -1 : Number(key[1]);
          if (stateRef.states[index] !== undefined) {
            const value = stateRef.states[index];
            return {
              value: value.src || './images/default/default-img.png',
              label: value.alt || 'image'
            };
          }
        }
        return "";

      case 'array':
        if (key[1] && stateRef.states) {
          const index = isNaN(Number(key[1])) ? -1 : Number(key[1]);
          if (stateRef.states[index] !== undefined) {
            const value = stateRef.states[index].value?.split(":");
            return {
              value: value[0],
              label: value[1] || value[0]
            };
          }
        }
        return "";

      case 'object':
        return getStateValue([key[1]], stateRef.states);

      default:
        return stateRef.defaultValue !== undefined ? stateRef.defaultValue : "";
    }
  } catch (e) {
    // If an error occurs, display an error message and return an empty string
    console.error("Something went wrong.");
    return "";
  }
};
