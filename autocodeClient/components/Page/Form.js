


const React = require("react");

import { useEffect } from "react";
import FormServices from '../../libs/services/forms'
import { getFileExtension }  from '../../utils/utils'

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

     useEffect(() => {

          if (!_states["__setting__"])
               _states["__setting__"] = {}
     }, [])

     const onSubmitForm = async (e) => {

          e.stopPropagation();
          e.preventDefault();


          const formElement = e.currentTarget;
          const formData = new FormData(formElement);

          const formDataObject = Object.fromEntries(formData.entries());


          _states["__setting__"].loading = 1;
          _states["__setting__"].error = 0;
          _states["__setting__"].success = 0;
          if (fun?.onSubmit)
               fun.onSubmit(_states);

          let isValid = true;
          const data = new FormData();


          Object.keys(_states).forEach((key) => {

               if (key !== '__setting__') {

                    const stateData = _states[key];


                    let fieldData = '';
                    let regexTest = true;
                    if (stateData.type === 'file') {
                         fieldData = formDataObject[key];
          
                         if (fieldData) {
                              const maxSize = stateData.maxSize || 1;
                              const acceptOptions = stateData.acceptOptions || '';

                              const maxSizeInBytes = maxSize * 1024 * 1024;

                              if (!acceptOptions.includes(fieldData.type)) {
                                   alert('Invalid file type. Please select a valid file type.');
                                   regexTest = false;
                              } else if (fieldData.size > maxSizeInBytes) {
                                   alert('File size exceeds the maximum allowed size.');
                                   regexTest = false;

                              } else {
                                   const ext = getFileExtension(fieldData.name);
                                   data.append(`files[]`, fieldData, `${key}.${ext}`);

                              }

                         }

                        

                    } else {
                         fieldData = stateData.defaultValue || formDataObject[key];

                         if (stateData.regex) {
                              const regexString = stateData.regex;
                              const cleanedRegexString = regexString.replace(/^\/|\/$/g, '');
                              const regex = new RegExp(cleanedRegexString);

                              regexTest = regex.test(fieldData)
                         }

                         if (regexTest)
                              data.append(key, fieldData);

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



          if (isValid) {
               try {
                    console.log(Object.fromEntries(data.entries()), formData)

                    const res = await FormServices.submit(_id, data);

                    if (res.status) {
                         _states["__setting__"].error = 0;
                         _states["__setting__"].success = 1;
                         _states["__setting__"].laoding = 0;

                         Object.keys(_states).forEach((key) => {
                              if (key !== '__setting__') {
                                   _states[key].defaultValue = '';
                              }
                         })

                         if (fun?.onSubmit)
                              fun.onSubmit(_states);
                    }

               } catch (e) {


                    _states["__setting__"].error = 1;
                    _states["__setting__"].success = 0;
                    _states["__setting__"].laoding = 0;

                    if (fun?.onSubmit)
                         fun.onSubmit(_states);



               } finally {

               }


          } else {

               _states["__setting__"].error = 1;
               _states["__setting__"].success = 0;
               _states["__setting__"].loading = 0;
               if (fun?.onSubmit)
                    fun.onSubmit(_states);
          }

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
                    colStates: colStates
               })
          })}
          <button type="submit">SUbmit</button>
     </form>



};


export default Form;