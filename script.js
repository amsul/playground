(function($) {

    var CharCounter = function( elem, options ) {

        var self = {}


        // return false if it's not a textarea
        if ( elem.type !== 'textarea' ) { return false }



        // update the values and lengths
        self.update = function() {

            self._value = self.$elem.val()
            self._length = self._value.length

            return self
        }



        // check the status
        self.keypress = function(e) {

            var selected = ( self.$elem[0].selectionEnd !== self.$elem[0].selectionStart )

            // get the latest values and lengths
            self.update()

            // check if selected
            if ( !selected ) {

                // if one more character makes length greater than max length
                if ( String.fromCharCode( e.charCode ).length && self._length + 1 > self._maxlength ) {
                    e.preventDefault()
                }
            }

            return self
        }



        // count the characters and print number left
        self.count = function() {

            self
                // get the latest values and lengths
                .update()

                // print the counter
                .print()

            return self
        }



        // print the counter
        self.print = function() {

            // the length cannot be greater than the maxlength
            if ( self._maxlength < self._length ) {
                self._length = self._maxlength
            }

            self.$counter[0].innerHTML = self._maxlength - self._length + ' characters left'
            return self
        }



        // check if the value needs trimming
        self.checkClipboard = function(e) {

            // get the latest values and length
            self.update()

            var clipboardText = e.originalEvent.clipboardData.getData( 'text' )

            // check it the text being pasted needs trimming
            if ( clipboardText.length > self._maxlength ) {

              // prevent initial event
              e.preventDefault()

              // set current value to clipboard text
              self._value = clipboardText

              self
                  // trim if needed
                  .trim()

                  // update the values
                  .update()

                  // then print
                  .print()
            }

            return self
        }



        // trim the value to the maxlength
        self.trim = function() {
            self.$elem[0].value = self._value.substr( 0, self._maxlength )
            return self
        }




        // initialize everything
        self.initialize = (function() {

            // bind the default options
            self.options = $.extend( {}, defaults, options )

            // store the maxlength
            self._maxlength = self.options.maxChars

            // store the elem and create & store the counter box
            self.$elem = $( elem )
            self.$counter = $( '<div class="js-charCounter" />' )

            // do stuff with the $elem
            self.$elem

                // place counter with the $elem append method
                [ self.options.appendMethod ]( self.$counter )

                // bind events
                .on({
                    'keypress':             self.keypress,
                    'input keyup cut':      self.count,
                    'paste':                self.checkClipboard
                })

            return self
        })()


        return self
    },


    // set the defaults
    defaults = {
        maxChars:           1000,
        maxCharsWarning:    80,
        msgFontSize:        '11px',
        msgFontColor:       '#000000',
        msgFontFamily:      'Arial',
        msgTextAlign:       'right',
        msgWarningColor:    '#F00',
        appendMethod:       'after'
    }


    // extend jquery
    $.fn.charCounter = function ( options ) {

        // go through each object passed and return it
        return this.each(function () {

            // check if it hasnt been attached
            if ( !$.data(this, 'charCounting') ) {

                // bind the plugin
                $.data( this, 'charCounting', CharCounter( this, options ) )
            }
        })
    }

})(jQuery);






