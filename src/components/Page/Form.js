


import React, { useEffect } from "react";
import FormServices from '../../libs/services/forms'

const Form = (props) => {

     const {
          children,
          _id,
          _states,
          _props,
          colStates,
          onChange,
          disabled,
          onSubmit,
          onClick, } = props;

     useEffect(() => {

          if (!_states["__setting__"])
               _states["__setting__"] = {}
     }, [])

     const onSubmitForm = async (e) => {

          e.preventDefault();


          const formElement = e.currentTarget;
          const formData = new FormData(formElement);

          const formDataObject = Object.fromEntries(formData.entries());

          _states["__setting__"].laoding = 1;
          onSubmit(_states);

          let isValid = true;
          const data = {};

          Object.keys(formDataObject).forEach((key) => {

               const stateData = _states[key];
               const fieldData = formDataObject[key];

               const regexString = stateData.regex;
               const regex = new RegExp(regexString);

               if ((stateData.required && !fieldData) || !regex.test(fieldData)) {
                    stateData.error = 1;
                    isValid = false;
               }
               else {
                    stateData.error = 0;
                    data[key] = fieldData;

               }



          });

          if (isValid) {
               try {

                    const res = await FormServices.submit(_id, data);

                    if (res.status) {
                         _states["__setting__"].error = 0;
                         _states["__setting__"].success = 1;
                         _states["__setting__"].laoding = 0;

                         onSubmit(_states)
                    }

               } catch (e) {

                    _states["__setting__"].error = 1;
                    _states["__setting__"].success = 0;
                    _states["__setting__"].laoding = 0;

                    if (e?.message && typeof e.message === 'object') {
                         for (const key in e.message) {
                              if (_states[key]) {
                                   _states[key].errorMessage = e.message[key];
                              }
                         }
                    }

                    onSubmit(_states);



               } finally {

               }


          } else {
               _states["__setting__"].error = 1;
               _states["__setting__"].success = 0;
               _states["__setting__"].laoding = 0;

               onSubmit(_states)
          }

     }

     return <form onSubmit={onSubmitForm} >

          {React.Children.map(children, (child) => {
               return child && React.cloneElement(child, {
                    onChange: onChange,
                    onClick: onClick,
                    disabled,
                    _id: _id,
                    _states: _states,
                    _props: _props,
                    colStates: colStates
               })
          })}

     </form>



};


export default Form;