
(function($, window, document, undefined) {


    /*
        APP stuff
    ========================================================================== */

    var APP   =   {


      start:    function() {
                    var self        =   this,
                        $content    =   $( document.body ),
                        validation  =   function(i) {
                                            var options     =   {},
                                                form        =   this;

                                            // for IE 7
                                            form.dataset = form.dataset || {}

                                            if ( form.dataset.type === 'form_feedback' ) {
                                                options.callback = function() {
                                                    $content
                                                        .find('.js-box-content').addClass('hidden').end()
                                                        .find('.js-box-success').removeClass('hidden');
                                                    scrollPageTo(0);
                                                }
                                            }

                                            else if ( form.dataset.type === 'form_password_change' ) {
                                                options.newPasswordId = 'password-new'

                                                options.beforeSubmit = function() {
                                                    console.log( form )
                                                    return false
                                                }
                                            }

                                            else if ( form.dataset.type === 'form_email_friend' ) {
                                                options.callback = function(){
                                                    $content
                                                        .find('#email-friend #email-form').addClass('hidden').end()
                                                        .find('#email-friend #email-success').removeClass('hidden');
                                                    scrollPageTo(550);
                                                }
                                            }
                                            
                                            else if ( form.dataset.type == 'form_update_profile' ) {
                                                options.callback = function() {
                                                    $content
                                                        .find('#top .generic-success').show();
                                                    scrollPageTo(0);  
                                                }
                                            }

                                            Validator( form, options )
                                        };
                    
                    
                    
                    $content
                        // map each form to a validator
                        .find( '.js-form' ).map( validation )
                        .end().end()

                        // bind listener to apply the text counter on ready
                        .find( '.js-text-counter' ).on('ready.counter', textCounter).trigger('ready')
                        .end()
/*
                        // bind dropkick to `select`
                        .find( '.js-dropkick' ).dropkick();
                    */
                    return self;
      } // start


    }, // APP



    /*
        Bind a text counter on focus
    ========================================================================== */

    textCounter = function(e) {
        var field       =   this,
            $field      =   $(field);
/*
        $field
            // bind the counter plugin
            .jqEasyCounter({
                maxChars:           1000,
                maxCharsWarning:    988,
                msgFontFamily:      ''
            })

            // trigger it once to show the counter
            .trigger('keydown')

            // disable the listener
            .off( '.counter' );*/
    },




    /* ==========================================================================

        Form validation
        ===============

        • Forms should have the class `js-form`
        • Submit buttons do not need an additional class

        • The validator accepts 2 arguments: `form` and `options`
            - form: the actual form element (not the jQuery object)
            - options: can contain options for specific forms


        Form errors
        ===========

        • General form error should have the class `js-form-warning hidden`
        • Fields with inline errors should have the following attribute:
            `data-warning="__WARNING_MESSAGE_HERE__"`


        Form fields
        ===========

        • Required fields should have the attribute `data-required="true"`
        • Optional fields that require validation if filled in (eg email),
            should have the attribute `data-type="email"`

        • Check `self.validateField` for more info


        Form event bindings
        ===================

        • Bind events on form elements, such as a radio button that makes
            email required on a value change, add the `data-bind` attribute:
            `
                data-bind='{
                    "type":     "intention",
                    "action":   "__UNIQUE_ACTION_NAME_HERE__",
                    "value":    "__SOME_VALUE_HERE__"
                }'
            `

            *** Remove the whitespace & line breaks ***

        • Check `self.bindEvent` for more info


    ========================================================================== */

    Validator = function(form, options) {
        var self = {}




        /* 

            Validate required fields
            ------------------------

            • Validated using the attribute `data-required="true"`
            • Required fields can be:
                - textarea
                - input[type=text]
                - input[type=checkbox]


            Validate optional fields
            ------------------------

            • Validated using the attribute `data-type`.
            • The field's `data-type` is validated with regEx

        ======================================================================== */

        self.validateField = function($field) {

            var fieldType           =       $field[0].type,
                fieldValue          =       ( fieldType === 'checkbox' || fieldType === 'radio' ) ? $field[0].checked : $field[0].value,
                fieldDataType       =       $field[0].dataset.type,
                fieldDataWarning    =       $field.data('type-warning')


            // if there is already an error, return as invalid
            if ( $field.prev('.js-error').length ) {
                return false
            }


            // if there isn't already an error there
            else {


                /** Textareas & Checkboxes **/

                if ( ( fieldType === 'textarea' && !fieldValue ) || ( fieldType === 'checkbox' && !fieldValue ) ) {
                    self.warningShow( $field )
                    return false
                }


                /** Input fields **/

                else if ( fieldType === 'text' ) {

                    // if there's no value and no data-type
                    if ( !fieldValue && !fieldDataType ) {
                        self.warningShow( $field )
                        return false
                    }

                    // if there's no value but has a data-type
                    else if ( !fieldValue && fieldDataType ) {
                        self.warningShow( $field )
                        return false
                    }

                    // if there's a value and a data-type
                    else if ( fieldValue && fieldDataType ) {

                        // validate it against regex
                        if ( !regEx[ fieldDataType ].test( fieldValue ) ) {
                            self.warningShow( $field, fieldDataWarning )
                            return false
                        }
                    }


                    else {
                        console.log( 'some other text type', fieldDataType, $field )
                    }
                } // fieldType = text



                /** Passwords **/

                else if ( fieldType === 'password' ) {

                    // if there's no value
                    if ( !fieldValue ) {
                        self.warningShow( $field )
                        return false
                    }

                    // if there is a value
                    else {


                        // if length is too short
                        if ( fieldValue.length < 8 ) {


                            // if there is only one possible data warning
                            if ( typeof fieldDataWarning === 'string' ) {
                                self.warningShow( $field, fieldDataWarning )
                                return false
                            }


                            // if there are multiple possible warnings
                            else {

                                // if the field has a data type
                                if ( fieldDataType === 'password_confirm' ) {
                                    var origField;

                                    // validate with the new password field
                                    for ( var i = 0, len = self.collection.length; i < len; i += 1 ) {
                                        origField = self.collection[ i ][0]

                                        // if the id matches and the values dont match
                                        if ( origField.id === options.newPasswordId && origField.value !== fieldValue ) {
                                            self.warningShow( $field, fieldDataWarning.password_no_match )
                                            return false
                                        }
                                    }
                                }
                                

                                // otherwise show the length error
                                else {

                                    self.warningShow( $field, fieldDataWarning.password_short )
                                    return false   
                                }
                            }

                        }


                        // length is fine and has data type warning
                        else if ( fieldDataWarning ) {
                            
                            // check if secure password
                            if ( !regEx.password.test( fieldValue ) ) {
                                self.warningShow( $field, fieldDataWarning.password_insecure )
                                return false
                            }
                        }


                        else {
                            console.log( 'silence' )
                        }

                    } // fieldValue has length

                } // fieldType = password



                else {

                    // by now, either the field is valid
                    // or a validation method hasn't been written


                    //////console.log( 'this field seems valid' )
                    //////console.dir( $field )
                }

            }

            return
        }





        /*

            Bind events to fields
            ---------------------

            • Bind events to fields with `data-bind` attribute. example:
                `
                    data-bind='{
                        "type":     "intention",
                        "action":   "email_required",
                        "value":    "true"
                    }'
                `

                *** `$field.intent` is the object created from `data-bind` ***

            • `intent.action` determines the function to invoke from the
                `self.bindEvent` object

        ======================================================================== */

        self.bindEvent = {

            email_required:     function($field) {

                                    // store the target
                                    $field.$target = $field.$target || self.$form.find( '[data-type=email]' )

                                    ////////console.dir( $field.$target )


                                    // bind the event to the field
                                    $field.on( 'change.intent', function() {

                                        var is_required = $field.intent.value

                                        $field.$target[0].dataset.required = is_required

                                        if ( is_required === 'false' ) {
                                            self.warningRemove( $field.$target )
                                        }

                                        //////console.log( $field.$target )
                                    })
                                    // create a listener 
            }

        } // self.bindEvent



        /** Warning template **/

        self.warningTemplate = (function() {
            return $( '<div class="form-error-box error js-error"><span class="arrow"></span><p class="desc js-msg"></p></div>' )
        })()



        /** Show warning on given field **/

        self.warningShow = function($field, dataWarning) {
            var message = dataWarning || $field[0].dataset.warning,
                warning = self.warningTemplate.clone()


            // bind the warning remover function
            warning.remover = function() {
                self.warningRemove( $field )
            }

            warning
                // put the message in the warning
                .find('.js-msg').text( message )
                .end()

                // paint the warning before the field
                .insertBefore( $field )


            // bind listener to remove warning
            $field.addClass('warning').on( 'keydown.warning change.warning', warning.remover )

            return self
        }


        /** Remove the warning for a given field **/

        self.warningRemove = function($field) {

            $field
                // remove the warning class
                .removeClass( 'warning' )

                // switch off the listner
                .off( '.warning' )

                // remove the error
                .prev('.js-error').remove()


            // hide the general form warning
            self.$formWarning.hide()

            return self
        }


        /** Toggle the warning for a given field **/

        self.warningToggle = function($field) {

            console.log( $field )

            return self

            $field
                // switch off the listner
                .off( '.warning' )

                // remove the error
                .prev('.js-error').remove()


            // hide the general form warning
            self.$formWarning.hide()

            return self
        }



        /** Bind the validation to the submit buttons **/

        self.bindValidation = function($button, form) {

            var beginValidation = function(e) {

                var options     =   self.options,
                    is_valid    =   true,
                    validity,
                    doSubmit

                e.preventDefault()

                // recollect the fields
                self.collectCycle( self.$form[0] )

                // go through each field in the collection and validate
                for ( var i = 0, len = self.collection.length; i < len; i += 1 ) {
                    validity = self.validateField( self.collection[ i ] )
                }


                // validity returns as false or undefined
                is_valid = validity || is_valid


                // if not valid in the end
                if ( !is_valid ) {

                    // show the general form warning and scroll up to the form warning
                    scrollPageTo( self.$formWarning.show().offset().top - 40 )
                }

                // if the form is valid
                else {


                    if ( options.beforeSubmit ) {
                        doSubmit = options.beforeSubmit.call()
                    }


                    // if it's still safe to submit

                    if ( doSubmit ) {

                        console.log( 'ready to submit :)' )

                        // call the callback function
                        if ( options.callback ) {
                            options.callback.call()
                        }   
                    }
                }

            }


            $button
                // set validation binding to true
                .data( 'validatorBinding', true )

                // begin validation on click
                .on( 'click', beginValidation )

            return self
        } // bindValidation




        /** Cycle through the fields to find those with bindings **/

        self.bindIntents = function(form) {

            var $field


            // cycle through all the form fields
            for ( var i = 0, len = form.length; i < len; i += 1 ) {

                $field = $( form[ i ] )
                $field.intent = $field.data('bind')

                // if there's a binding
                if ( $field.intent ) {

                    // bind the events
                    self.bindEvent[ $field.intent.action ]( $field )
                }

            }


            return self
        }



        /** Add a field to the collection **/

        self.collectAdd = function($field) {
            self.collection.push( $field )
            return self
        }



        /** Check if a field needs to be collected **/

        self.collectCheck = function($field) {
            var addField = false


            // if the field is required, add to collection
            if ( $field[0].dataset.required === 'true' ) {
                addField = true
            }

            // if field isn't required, but has a value and a data type
            else if ( ($field[0].value && $field[0].dataset.type) ) {
                addField = true
            }

            // bind events to the submit button
            else if ( $field[0].type === 'submit' ) {

                // if the button doesn't have a binding, then bind validation
                if ( !$field.data('validatorBinding') ) {
                    self.bindValidation( $field, form )
                }
            }


            // if the field needs to be added
            if ( addField ) {
                self.collectAdd( $field )
            }
                

            return self
        }



        /** Cycle through the fields in a form to add to collection **/

        self.collectCycle = function(form) {

            var $field

            // create an emtpy collection for this form
            self.collection = []


            // cycle through all the form fields
            for ( var i = 0, len = form.length; i < len; i += 1 ) {

                // check and collect the fields
                self.collectCheck( $( form[ i ] ) )
            }

          return self
        }



        /** Initialize the Validator **/

        self.initialize = (function() {

            // store the form
            self.$form = $( form )

            // store the general form warning
            self.$formWarning = self.$form.find( '.js-form-warning' )

            // store the options
            self.options = options

            // cycle through all the fields in this form to collect
            self.collectCycle( form )

            // do the bindings on the form fields
            self.bindIntents( form )

            return self
        })()


        console.log( 'Validator', self )


        return self
    },



    /** Some regex **/

    regEx = {

        email:      /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i,
        password:   /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])((?=[^!@#\$%]*[!@#\$%])|(?=[^0-9]*[0-9]))/

    },



    /*
        Scroll the page to a specific vertical position
    ======================================================================== */

    scrollPageTo = function(position, speed) {

        // set the defaults
        position = position || 0;
        speed = ( speed === undefined || speed === null ) ? 250 : speed;

        $('body, html').animate({ scrollTop: position }, speed);
    };



    /*
        Start 'er up
    ========================================================================== */

    APP.start();


})(jQuery, window, document);











