
/* ==========================================================================

  Form validation with event bindings

========================================================================== */


/* * /
(function($, window, document, undefined) {
/* */

  /*
    APP stuff
  ========================================================================== */

  var APP   =   {


      /*
        Start everything up
      ========================================================================== */

      start:      function() {
                    var self      =   this,
                        $content  =   $( document.body ),
                        validate  =   Validator,
                        bind      =   Binder
                    

                    $content
                      // find the data bindings
                      .find( '[data-bind]' ).map(function(i) {
                        self.bind( this )
                      }).end().end()

                      // initialize the validator on the content
                      .find( '.js-form' ).map(function(i) {
                        validate( this )
                      })
                    
                    return self
      }, // start


      /*
        Data bindings
      ========================================================================== */

      bind:       function(elem) {
                    var self      =   this,
                        $elem     =   $( elem ),
                        intent    =   $elem.data('bind')


                    self.bindingAction[ intent.type ]( $elem, intent )

                    return self
      },

      bindingAction:   {

                          form_action:    function($elem, intent) {

                                            var doAction = {}

                                            
                                            // bind the element depending on the intent
                                            $elem.on( intent.on, function(e) {
                                              doAction[ intent.action ]( $elem, intent.value )
                                            })


                                            // make the email required
                                            doAction.email_required = function($elem, value) {
                                              console.log( $elem, value )
                                            }

                                           // console.log( $elem, intent )
                          }
      }
      
      

  }, // APP





  /*
    Bind some awesome events
  ========================================================================== */

  Binder = function($elem, target) {
    var self = {}



    console.log( 'binding' )



    return self
  },





  /*
    Let the validation begin!
  ========================================================================== */

  Validator = function(form) {
    var self = {}


    /** Warning template **/

    self.warningTemplate = (function() {
      return $( '<div class="form-error-box error js-error"><span class="arrow"></span><p class="desc js-msg"></p></div>' )
    })()



    /** Show warning on given field **/

    self.warningShow = function($field) {
      var message = $field[0].dataset.warning,
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


      // show the general form warning
      self.$formWarning.show()


      // bind listener to remove warning
      $field.on( 'keydown.warning change.warning', warning.remover )

      return self
    }


    /** Remove the warning for a given field **/

    self.warningRemove = function($field) {

      $field
        // switch off the listner
        .off( '.warning' )

        // remove the error
        .prev('.js-error').remove()


      // hide the general form warning
      self.$formWarning.hide()

      return self
    }


    /** Validate the given field **/

    self.validateField = function($field, valid) {
      var fieldType = $field[0].type,
          fieldValue = ( fieldType === 'checkbox' || fieldType === 'radio' ) ? $field[0].checked : $field[0].value,
          fieldDataType

      // only validate if there isn't already an error there

      if ( !$field.prev('.js-error').length ) {

        /** textareas & checkboxes **/

        if ( ( fieldType === 'textarea' && !fieldValue ) || ( fieldType === 'checkbox' && !fieldValue ) ) {
          self.warningShow( $field )
          valid = false
        }

        else if ( fieldType === 'text' ) {

          if ( !self.regEx[ $field[0].dataset.type ].test( fieldValue ) ) {
            self.warningShow( $field )
            valid = false
          }
        }

        else {
          console.log( 'this field seems valid' )
          console.dir(  $field )
        }

      }

      return valid
    }


    /** Bind the validation to the submit buttons **/

    self._bindValidation = function($button, form) {

      var beginValidation = function(e) {
        var validity = true
        e.preventDefault()

        // recollect the fields
        self._collectCycle( self.$form[0] )

        // go through each field in the collection and validate
        for ( var i = 0, len = self.$collection.length; i < len; i += 1 ) {
          validity = self.validateField( self.$collection[ i ], validity )

          if ( (i+1) === len ) {
            console.log( 'last and form is ', validity )
          }
        }
      }


      $button
        // set data binding to true
        .data( 'binding', true )

        // begin validation on click
        .on( 'click', beginValidation )

      return self
    }



    /** Add a field to the collection **/

    self._collectAdd = function($field) {
      self.$collection.push( $field )
      return self
    }



    /** Check if a field needs to be collected **/

    self._collectCheck = function($field) {
      var addField = false


      // if the field is required, add to collection
      if ( $field[0].dataset.required ) {
        addField = true
      }

      // if field isn't required, but has a value and a data type
      else if ( ($field[0].value && $field[0].dataset.type) ) {
        addField = true
      }

      // bind events to the submit button
      else if ( $field[0].type === 'submit' ) {

        // if the button doesn't have a binding, then bind validation
        if ( !$field.data('binding') ) {
          self._bindValidation( $field, form )
        }
      }


      // if the field needs to be added
      if ( addField ) {
        self._collectAdd( $field )
      }

      return self
    }



    /** Cycle through the fields in a form to add to collection **/

    self._collectCycle = function(form) {

      // create a collection for this form
      self.$collection = []


      // cycle through all the form fields
      for ( var i = 0, len = form.length; i < len; i += 1 ) {

        // check and collect the fields
        self._collectCheck( $( form[ i ] ) )
      }

      return self
    }



    /** Initialize the Validator **/

    self._init = (function() {

      var field

      // store the form
      self.$form = $( form )

      // store the general form warning
      self.$formWarning = self.$form.find( '.js-form-warning' )


      // cycle through all the fields in this form to collect
      self._collectCycle( form )


      return self
    })()



    /** Some regex **/

    self.regEx = {
      email:      /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i
    }


    console.log( self )


    return self
  },









  validateForm = function(e) {
    e.preventDefault();

    var button          =   this,
        $button         =   $(this),
        $form           =   $button.closest('.js-form'),
        error           =   $form.find( '.generic-error' ),
        valid           =   true,
        showWarning     =   function($elem, error) {
                                var warning = $elem[0].dataset.warning;

                                // show the generic error
                                error.show();

                                // show the inline error
                                if ( !$elem.prev( '.form-error-box' ).length ) {
                                    error.inline = '<div class="form-error-box"><span class="arrow"></span><p class="desc" id="error_msg">' + warning + '</p></div>'
                                    $elem.before( error.inline );
                                }

                                
                                $elem
                                    .addClass('warning')

                                    // bind the change events
                                    .on({ 'keyup.validate change.validate': removeWarning })


                                // scroll up to the first error
                                $('body, html').animate({
                                    scrollTop: $('.form-error-box').first().offset().top - 40
                                }, 250);
        },
        removeWarning   =   function(e) {
                                var $elem = $(this);

                                // hide the generic error
                                error.hide();

                                
                                $elem
                                    .removeClass('warning')

                                    // remove this listener
                                    .off( '.validate' )

                                    // remove the warning
                                    .prev( '.form-error-box' ).remove();
        },
        regEx           =   {
                                email: /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i
        },
        field, valid;


    /** Get all the fields that need validation **/

    $form.fields = [];

    for ( var i=0, len=$form[0].length; i < len; i += 1 ) {

        field = $form[0][ i ];

        // if this is a required field, push it in the collection
        if ( field.dataset.required ) { $form.fields.push( field ) }

        // if the field isn't required but has a value, push it in the collection
        else if ( field.value && field.dataset.type ) {
            $form.fields.push( field )
        }
    }


    /** Validate each field in the collection **/

    $( $form.fields ).each(function(i, elem) {

        var $elem = $( elem );


        if ( ( elem.type === 'textarea' && !elem.value ) || ( elem.type === 'checkbox' && !elem.checked ) ) {

            showWarning( $elem, error );

            // set valid as false
            valid = false;
        }

        else if ( elem.type === 'text' ) {

            if ( elem.dataset.type === 'email' && !regEx.email.test( elem.value ) ) {

                showWarning( $elem, error );

                // set valid as false
                valid = false;
            }
        }

        else {
            console.log( 'no validation added yet' )
            console.dir( elem )
        }


        // if it's the last field to validate and the form is valid
        if ( $form.fields.length === (i+1) && valid ) {

            // show the success message
            $form
                .closest( '.js-box-content' ).addClass('hidden')
                .siblings( '.js-box-success' ).removeClass('hidden');
        }
    });


    return false;
  };



  /*
    Start 'er up
  ========================================================================== */

  APP.start();

/* * /
})(jQuery, window, document);
/* */










