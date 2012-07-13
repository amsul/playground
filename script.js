

/* * /
(function($, window, document, undefined) {
/* */


    /*
        APP stuff
    ========================================================================== */

    var APP   =   {


        start:      function() {
                        var self = this


                        // store the content elem
                        self.$content = $( document.body )
                        
                                            
                        self.$content

                            // map each form to a validator
                            .find( '.js-form' ).map( self.validation )
                            .end().end()
/*
                            // bind listener to apply the text counter on ready
                            .find( '.js-text-counter' ).on('ready.counter', textCounter).trigger('ready')
                            .end()
            
                            // bind dropkick to `select`
                            .find( '.js-dropkick' ).dropkick();
                        */
                        return self;
        }, // start



        /*

            Form Validation
            ---------------

            Forms can have custom validation events. To bind these events,
            add a `data-type` attribute to the form. Example:
                `data-type="__FORM_TYPE_HERE__"`


            Custom events can be attached to the form by checking the form type:
                `
                    if ( form.dataset.type === '__FORM_TYPE_HERE__' ) {
                        // start binding events here
                        // ...
                    }
                `

            The following functions are available to bind for custom form events:


            options.onLoad
            --------------

                A function to call on page load. The validator object is
                in the scope. Example:
                    `
                        options.onLoad = function( thisValidator ) {
                            // function goes here
                            // ...
                            console.log( thisValidator )
                        }
                    `


            options.beforeSubmit
            --------------------

                A function to call before a successful submit. The validator
                object is in the scope. Example:
                    `
                        options.onLoad = function( thisValidator ) {
                            // function goes here
                            // ...
                            console.log( thisValidator )
                        }
                    `

            options.callback
            ----------------

                A callback function called after a successful validation.
                Example:
                    `
                        options.callback = function() {
                            // function goes here
                            // ...
                        }
                    `

            options.bindEvent
            -----------------

                A function that binds events to fields with `data-bind`. The
                field and the validator object are in scope. Example:
                    `
                        options.bindEvent = function( $field, thisValidator ) {
                            // function goes here
                            // ...
                            console.log( $field, $field.intent, thisValidator )
                        }
                    `


        ======================================================================== */

        validation:     function(i) {

                            var options     =   {},
                                form        =   this,
                                validate    =   Validator,
                                $content    =   APP.$content;


                            // for IE 7
                            form.dataset = form.dataset || {}


                            /** Feedback form **/

                            if ( form.dataset.type === 'form_feedback' ) {

                                options.bindEvent = function( $field, thisValidator ) {

                                    var $form = thisValidator.$form


                                    // intention is to make the email required

                                    if ( $field.intent.action === 'email_required' ) {

                                        // store the target
                                        $field.$target = $field.$target || $form.find( '[data-type=email]' )

                                        // bind the event to the field
                                        $field.on( 'change.intent', function() {

                                            var is_required = $field.intent.value

                                            console.dir( $field )

                                            $field.$target[0].dataset.required = is_required

                                            if ( is_required === 'false' ) {
                                                thisValidator.warningRemove( $field.$target )
                                            }
                                        })
                                    }
                                }

                                options.callback = function() {
                                    $content
                                        .find('.js-box-content').addClass('hidden').end()
                                        .find('.js-box-success').removeClass('hidden')
                                    scrollPageTo(0)
                                }
                            }


                            /** Password change form **/

                            else if ( form.dataset.type === 'form_password_change' ) {

                                options.onLoad = function( thisValidator ) {
                                    var $field

                                    // go through the fields collection
                                    for ( var i = 0, len = thisValidator.collection.length; i < len; i += 1 ) {
                                        
                                        $field = thisValidator.collection[ i ]

                                        // store the password fields for later
                                        if          ( $field[0].id === 'password-new' )         {       thisValidator.$passwordNew = $field         }
                                        else if     ( $field[0].id === 'password-confirm' )     {       thisValidator.$passwordConfirm = $field     }
                                    }
                                }

                                options.beforeSubmit = function( thisValidator ) {

                                    var passwordConfirm     =   thisValidator.$passwordConfirm,
                                        passwordNew         =   thisValidator.$passwordNew,
                                        passwordsMatch      =   passwordConfirm.val() === passwordNew.val()

                                    // if the passwords don't match, show a warning
                                    if ( !passwordsMatch ) {

                                        // show the inline & form warning
                                        thisValidator
                                            .warningShow( passwordConfirm, passwordConfirm.data('type-warning') )
                                            .$formWarning.show()
                                    }

                                    return passwordsMatch
                                }
                            }


                            /** Email a friend form **/

                            else if ( form.dataset.type === 'form_email_friend' ) {
                                options.callback = function(){
                                    $content
                                        .find('#email-friend #email-form').addClass('hidden').end()
                                        .find('#email-friend #email-success').removeClass('hidden');
                                    scrollPageTo(550);
                                }
                            }
                   

                            /** Update profile form **/

                            else if ( form.dataset.type === 'form_update_profile' ) {
                                options.callback = function() {
                                    $content
                                        .find('#top .generic-success').show();
                                    scrollPageTo(0);  
                                }
                            }


                            // let the validation begin
                            validate( form, options )
        } // validation


    }, // APP



    /*
        Bind a text counter on focus
    ========================================================================== */

    textCounter = function(e) {
        var field       =   this,
            $field      =   $(field);

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
            .off( '.counter' );
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
        -----------

        • General form error should have the class `js-form-warning hidden`
        • Fields with inline errors should have the following attribute:
            `data-warning="__WARNING_MESSAGE_HERE__"`


        Multiple errors
        ---------------

        • Fields can have a multiple warnings based on `data-type`. Example:
            `data-type="__DATA_TYPE_HERE__"`
            `data-warning="__WARNING_MESSAGE_HERE__"`

        • Check `self.validateField` for more info


        Form fields
        -----------

        • Required fields should have the attribute `data-required="true"`
        • Optional fields that require validation if filled in (eg email),
            should have the attribute `data-type="__DATA_TYPE_HERE__"`

        • Check `self.validateField` for more info


        Bind events to fields
        ---------------------

        • Bind events to fields with the attribute `data-bind` with the
            following format:
                `
                    data-bind='{
                        "type":     "intention",
                        "action":   "__UNIQUE_ACTION_NAME_HERE__",
                        "value":    "__VALUE_HERE__"
                    }'
                `

        • Check `options.bindEvent` for more info


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


                    // if a new password is too short
                    else if ( fieldValue.length < 8 && fieldDataType === 'password_new' ) {
                        self.warningShow( $field, fieldDataWarning.password_short )
                        return false
                    }


                    // if password length is fine
                    else {

                        // if it's a new password and doesn't match regex
                        if ( fieldDataType === 'password_new' && !regEx.password.test( fieldValue ) ) {
                            self.warningShow( $field, fieldDataWarning.password_insecure )
                            return false
                        }

                        else {
                            //////console.log( $field )
                        }

                    }


                } // fieldType = password



                else {

                    // by now, either the field is valid
                    // or a validation method hasn't been written


                    //////console.log( 'this field seems valid' )
                    //////console.dir( $field )
                }

            }

            return

        } // self.validateField



        /** Warning template **/

        self.$warningTemplate = (function() {
            return $( '<div class="form-error-box error js-error"><span class="arrow"></span><p class="desc js-msg"></p></div>' )
        })()



        /** Show warning on given field **/

        self.warningShow = function($field, dataWarning) {
            var message = dataWarning || $field[0].dataset.warning,
                warning = self.$warningTemplate.clone()

            // if there is already an error, return as invalid
            if ( $field.prev('.js-error').length ) {
                return self
            }

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
                is_valid = ( validity === undefined || validity === null ) ? is_valid : validity


                // if not valid in the end
                if ( !is_valid ) {

                    // show the general form warning and scroll up to the form warning
                    scrollPageTo( self.$formWarning.show().offset().top - 40 )
                }

                // if the form is valid
                else {


                    if ( options.beforeSubmit ) {
                        doSubmit = options.beforeSubmit( self )
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

            } // beginValidation


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

                // bind events the fields with a bind request
                if ( self.options.bindEvent && $field.intent ) {
                    self.options.bindEvent( $field, self )
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

                $field = $( form[ i ] )

                // check and collect the fields
                self.collectCheck( $field )
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

            // invoke anything that needs to be called on load
            if ( self.options.onLoad ) {
                self.options.onLoad( self )
            }

            return self
        })()


        console.log( 'Validator', self )


        return self

    }, // Validator



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


/* * /
})(jQuery, window, document);
/* */











