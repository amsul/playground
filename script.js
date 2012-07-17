(function($) {

    var CharCounter = function( elem, options ) {

        var self = {}


        // return false if it's not a textarea
        if ( elem.type !== 'textarea' ) { return false }



        // check the status
        self.keypress = function(e) {

            var selected = ( self.$elem[0].selectionEnd !== self.$elem[0].selectionStart )

            // get the latest values and lengths
            self.update()

            // check if not selected
            if ( !selected ) {

                // if one more character makes length greater than max length
                if ( String.fromCharCode( e.charCode ).length && self._length + 1 > self._maxlength ) {
                    e.preventDefault()
                }
            }

            return self
        }



        // check the paste event
        self.pasteEvent = function(e) {

            var selection = {},
                elem = this

            e.preventDefault()

            // all browsers
            if ( window.getSelection ) {
                selection.selected = window.getSelection().toString()
                selection.start = elem.selectionStart
                selection.end = elem.selectionEnd
                selection.pastedText = e.originalEvent.clipboardData.getData('text')
            }


            // for IE
            else {
                selection.range = document.selection.createRange()
                selection.selected = selection.range.text
            }


            // store the text before and after seleection
            selection.startText = elem.value.substr( 0, selection.start )
            selection.endText = elem.value.substr( selection.end )

            // check the characters available to be pasted
            selection.charsRemaining = self.options.maxChars - ( selection.startText.length + selection.endText.length )


            // if there's no space left, just return it
            if ( !selection.charsRemaining ) {
                return self
            }


            // compose the selection and current value with the pasted text truncated
            self._value = selection.startText + selection.pastedText.substr( 0, selection.charsRemaining ) + selection.endText


            //console.log( selection )


            // trim the value so that it updates in the actual textarea
            self.trim()


            // if there was a selection, set caret to the end point
            if ( selection.selected ) {
                elem.setSelectionRange( selection.end, selection.end )
            }

            // otherwise move to the start plus characters left
            else {
                elem.setSelectionRange( selection.start + selection.charsRemaining, selection.start + selection.charsRemaining )
            }


            // update and then print the chars left
            self.update().print()


            return self
        }


/*

        // check the length after a paste event
        self.paste = function() {

            self
                // get the latest values and lengths
                .update()

                // trim the values
                .trim()

                // print the counter
                .print()

            return self
        }*/




        // count the characters and print number left
        self.count = function() {

            self
                // get the latest values and lengths
                .update()

                // print the counter
                .print()

            return self
        }



        // update the values and lengths
        self.update = function() {

            self._value = self.$elem.val()
            self._length = self._value.length

            return self
        }



        // trim the value to the maxlength
        self.trim = function() {
            self.$elem[0].value = self._value.substr( 0, self._maxlength )
            return self
        }



        // print the counter
        self.print = function() {

            // the length cannot be greater than the maxlength
            if ( self._maxlength < self._length ) {
                self._length = self._maxlength
            }

            self.$counter[0].innerHTML = self._maxlength - self._length + ' ' + self.options.msgCharsLeft
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
                    //'paste':                function() { setTimeout( self.paste, 10 ) },
                    'paste':                self.pasteEvent
                })

            return self
        })()


        return self
    },


    // set the defaults
    defaults = {
        maxChars:           1000,
        maxCharsWarning:    80,
        msgCharsLeft:       'characters left',
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






