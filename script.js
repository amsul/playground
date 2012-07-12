
/* ==========================================================================

  Form validation with event bindings

========================================================================== */


/* */
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
                    var self        =   this,
                        $content    =   $( document.body ),
                        validation  =   function(i) {
                                          Validator( this )
                                        }
                    
                    // map each form to a validator
                    $content.find( '.js-form' ).map( validation )
                    
                    return self
      } // start
      
      

  }, // APP





  /*
    Let the validation begin!
  ========================================================================== */

  Validator = function(form) {
    var self = {}



    /** Bind events with various intents **/

    self.bind = {

      email_required:   function($field) {

                          // store the target
                          $field.$target = $field.$target || self.$form.find( '[data-type=email]' )

                          console.dir( $field.$target )
                          // bind the event to the field
                          $field.on( 'change.intent', function() {

                            var is_required = $field.intent.value

                            $field.$target[0].dataset.required = is_required

                            if ( !is_required ) {
                              self.warningRemove( $field.$target )
                            }

                            //////console.log( $field.$target )
                          })
                          // create a listener 
      }

    } // self.bind



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



    /** Validate the given field **/

    self.validateField = function($field, valid) {
      var fieldType = $field[0].type,
          fieldValue = ( fieldType === 'checkbox' || fieldType === 'radio' ) ? $field[0].checked : $field[0].value,
          fieldDataType

      // if there is already an error, return as invalid

      if ( $field.prev('.js-error').length ) {
        valid = false
      }


      // if there isn't already an error there
      
      else {

        /** textareas & checkboxes **/

        if ( ( fieldType === 'textarea' && !fieldValue ) || ( fieldType === 'checkbox' && !fieldValue ) ) {
          self.warningShow( $field )
          valid = false
        }

        else if ( fieldType === 'text' ) {

          if ( !regEx[ $field[0].dataset.type ].test( fieldValue ) ) {
            self.warningShow( $field )
            valid = false
          }
        }

        else {
          console.log( 'this field seems valid' )
          console.dir( $field )
        }

      }

      return valid
    }



    /** Bind the validation to the submit buttons **/

    self.bindValidation = function($button, form) {

      var beginValidation = function(e) {

        var validity = true

        e.preventDefault()

        // recollect the fields
        self.collectCycle( self.$form[0] )

        // go through each field in the collection and validate
        for ( var i = 0, len = self.$collection.length; i < len; i += 1 ) {

          validity = self.validateField( self.$collection[ i ], validity )

          if ( (i+1) === len && validity ) {
            self.$form.find('.js-box-success').removeClass('hidden')
          }
        }

        // if not valid in the end, show the general form warning
        if ( !validity ) { self.$formWarning.show() }

      }


      $button
        // set data binding to true
        .data( 'binding', true )

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
          //Binder( $field, form )

          // bind the events
          self.bind[ $field.intent.action ]( $field )
        }

      }
      

      return self
    }



    /** Add a field to the collection **/

    self.collectAdd = function($field) {
      self.$collection.push( $field )
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
        if ( !$field.data('binding') ) {
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
      self.$collection = []


      // cycle through all the form fields
      for ( var i = 0, len = form.length; i < len; i += 1 ) {

        // check and collect the fields
        self.collectCheck( $( form[ i ] ) )
      }

      return self
    }



    /** Initialize the Validator **/

    self.__proto__.initialize = (function() {

      // store the form
      self.$form = $( form )

      // store the general form warning
      self.$formWarning = self.$form.find( '.js-form-warning' )


      // cycle through all the fields in this form to collect
      self.collectCycle( form )

      // do the bindings on the form fields
      self.bindIntents( form )

      return self
    })()


    console.log( 'Validator', self )


    return self
  }



  /** Some regex **/

  regEx = {

    email:      /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i

  };











  /*
    Start 'er up
  ========================================================================== */

  APP.start();

/* */
})(jQuery, window, document);
/* */










