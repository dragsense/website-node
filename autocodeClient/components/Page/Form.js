import React, { useEffect, useState } from "react";
import FormServices from '../../libs/services/forms';
import { getFileExtension } from '../../utils/utils';

// Form component
const Form = (props) => {

     const {
          children,
          _id,
          _states,
          _props,
          colStates,
          fun,
          disabled,
     } = props;

     // Initialize settings if not present
     useEffect(() => {
          if (!_states["__setting__"])
               _states["__setting__"] = {}
     }, [])

     // State to handle button disable

     // Function to handle form submission
     const onSubmitForm = async (e) => {
          e.stopPropagation();
          e.preventDefault();

          const formElement = e.currentTarget;
          const formData = new FormData(formElement);

          const formDataObject = Object.fromEntries(formData.entries());

          // Set initial states
          setInitialStates();
          const data = new FormData();
          // Validate form data
          let isValid = validateFormData(formDataObject, data);

          // If form data is valid, submit form
          if (isValid) {

               submitForm(data);
          } else {
               // If form data is not valid, set error state
               setErrorState();
          }
     }

     // Function to set initial states
     const setInitialStates = () => {
          _states["__setting__"].loading = 1;
          _states["__setting__"].error = 0;
          _states["__setting__"].success = 0;
          if (fun?.onSubmit)
               fun.onSubmit(_states);
     }

     // Function to validate form data
     const validateFormData = (formDataObject, data) => {
          let isValid = true;
          

          Object.keys(_states).forEach((key) => {
               if (key !== '__setting__') {
                    const stateData = _states[key];
                    let fieldData = '';
                    let regexTest = true;

                    if (stateData.type === 'file') {
                         fieldData = handleFileField(stateData, formDataObject[key], data, key);
                         regexTest = fieldData !== null;
                    } else {

                         fieldData = handleTextField(stateData, formDataObject[key], data, key);
                         regexTest = fieldData !== null;
                    }

                    if ((stateData.required && !fieldData) || !regexTest) {
                         stateData.error = 1;
                         isValid = false;
                    }
                    else {
                         stateData.error = 0;
                    }
               }
          });

          return isValid;
     }

     // Function to handle file field
     const handleFileField = (stateData, fieldData, data, key) => {
          if (fieldData) {
               const maxSize = stateData.maxSize || 1;
               const acceptOptions = stateData.acceptOptions || '';
               const maxSizeInBytes = maxSize * 1024 * 1024;

               if (!acceptOptions.includes(fieldData.type)) {
                    alert('Invalid file type. Please select a valid file type.');
                    return null;
               } else if (fieldData.size > maxSizeInBytes) {
                    alert('File size exceeds the maximum allowed size.');
                    return null;
               } else {
                    const ext = getFileExtension(fieldData.name);
                    data.append(`files[]`, fieldData, `${key}.${ext}`);
                    return fieldData;
               }
          }
          return '';
     }

     // Function to handle text field
     const handleTextField = (stateData, fieldData, data, key) => {
          fieldData = stateData.defaultValue || fieldData;

          if (stateData.regex) {
               const regexString = stateData.regex;
               const cleanedRegexString = regexString.replace(/^\/|\/$/g, '');
               const regex = new RegExp(cleanedRegexString);

               if (!regex.test(fieldData)) {
                    return null;
               }
          }

          data.append(key, fieldData);
      

          return fieldData;
     }

     // Function to submit form
     const submitForm = async (formData) => {
          try {
               const res = await FormServices.submit(_id, formData);

               if (res.status) {
                    setSuccessState();
               }
          } catch (e) {
               setErrorState();
          }
     }

     // Function to set success state
     const setSuccessState = () => {
          _states["__setting__"].error = 0;
          _states["__setting__"].success = 1;
          _states["__setting__"].loading = 0;

          Object.keys(_states).forEach((key) => {
               if (key !== '__setting__') {
                    _states[key].defaultValue = '';
               }
          })

          if (fun?.onSubmit)
               fun.onSubmit(_states);
     }

     // Function to set error state
     const setErrorState = () => {
          _states["__setting__"].error = 1;
          _states["__setting__"].success = 0;
          _states["__setting__"].loading = 0;
          if (fun?.onSubmit)
               fun.onSubmit(_states);
     }



     return <form onSubmit={onSubmitForm} target="_self">

          {React.Children.map(children, (child) => {
               return child && React.cloneElement(child, {
                    key: child.props?._uid,
                    fun,
                    disabled,
                    _id: _id,
                    _states: _states,
                    _props: _props,
                    colStates: colStates,
               })
          })}
 
     </form>
};

export default Form;