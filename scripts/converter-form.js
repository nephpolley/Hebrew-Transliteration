//  converter-form.js

//  This file creates a global ConverterForm object containing the public convert
//  and all additional helper methods.

//  The purpose of this program is to act as a tool to help interface with the text-to-ipa.js program
//  by providing a method to take text input from a text field, output the translated
//  IPA text, and output any error messages if need be.

//      ConverterForm.convert(inID, outID, errID)
//          inID        This is the name of the unique ID (string) of a text area
//                      that input should be read from. The program will find
//                      the first instance of this ID and assume it contains
//                      the english text to convert.
//          outID       This is the name of the unique ID (string) of a text area
//                      that out should be sent to. The program will find
//                      the first instance of this ID and assume it is a text
//                      field, and output the translated IPA there.
//          errID       This is the name of the unique ID (string) of a div that errors
//                      will be output to. The div will automatically be filled
//                      with a paragraph <p> element, and existing data in it
//                      will be overwritten
//          This method produces no output, but will take the value of the inID
//          text area and convert that text with TextToIPA. If the inID, or
//          TextToIPA object do not exist or are not objects, the method will
//          not do anything.

// Create a ConverterForm object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
if (typeof ConverterForm !== 'object') {
  ConverterForm = {};
}

(function () {

  'use strict';

  // Error messages

  // Error message if a word entered is not defined within the dictionary
  if (typeof ConverterForm._undefMsg !== 'string') {
    ConverterForm._undefMsg = 'Some words you have entered cannot be found in the IPA dictionary.';
  }

  // Error message if a word has multiple pronunciations and therefore multipe IPA translations
  if (typeof ConverterForm._multiMsg !== 'string') {
    ConverterForm._multiMsg = 'Some words you have entered have multiple pronunciations in english. These differences are seperated with "OR"';
  }

  // Functions

  // Update a specific div by placing a paragraph inside it
  if (typeof ConverterForm._updateParagraph !== 'function') {
    ConverterForm._updateParagraph = function (inID, text) {
        document.getElementById(inID).innerHTML = '<p>' + text + '</p>';
    };
  }

  // Update a text area by replacing its contents
  if (typeof ConverterForm._updateTextArea !== 'function') {
    ConverterForm._updateTextArea = function (inID, text) {
        document.getElementById(inID).value = text;
    };
  }

  if (typeof ConverterForm.convert !== 'function') {
    ConverterForm.convert = function (inID, outID, errID) {

      if (typeof inID !== 'string') {
        console.log("TextToIPA Error: 'inID' called in 'ConverterForm.convert()' is not a valid ID");
      } else if (typeof TextToIPA !== 'object') {
        console.log("TextToIPA Error: 'TextToIPA' object not found. Is 'text-to-ipa.js' included before ConverterForm.convert() is ran?");
      } else {

        // Reset the error messages
        var currentErrorMessage = '';
        var currentMultiMessage = '';

        // Resulting array of IPA text words
        var IPAText = [];

        // Get the input from the inID as an array of strings that are each individual word
        var englishTextArray = document.getElementById(inID).value.split(/\s+/g);

        // Begin converting
        for (var i in englishTextArray) {

          // Lookup the word with TextToIPA. The first element will be the error
          // with the word, the second element will be the converted word itself.
          var IPAWord = TextToIPA.lookup(englishTextArray[i].toLowerCase().replace(/[^\w\s]|_/g, '').replace(/\s+/g, ' '));

          // Does the word exist?
          if (typeof IPAWord.error === 'undefined') {

            // No, so set the error message
            currentErrorMessage = ConverterForm._undefMsg;
            // Push plain text instead of IPA
            IPAText.push(englishTextArray[i]);

          // If it does, see how many pronunciations there are (TextToIPA knows this, and sends all pronunciations regardless)
          } else if (IPAWord.error === 'multi') {

              currentErrorMessage = ConverterForm._multiMsg;
              IPAText.push(IPAWord.text);

          // Otherwise just push the converted word
          } else {

              IPAText.push(IPAWord.text);

          }

        }



        // For word in the IPAText
        let HebrewText = IPAText.map((word) => {
          console.log("Current word: " + word);
          // For char in the word
          return word.split('').map((char, i) => {
                console.log("Current char: " + char);

                // Check if char has a final form and it's the last sound
                if (!IPAToHebrew.lookup(`${char}(final)`).error) {
                  if (i === word.length - 1) {
                    console.log("Returning final form: " + IPAToHebrew.lookup(`${char}(final)`).text)
                    return IPAToHebrew.lookup(`${char}(final)`).text
                  }

                }

                if (!IPAToHebrew.lookup(char).error) {
                  console.log("Returning char: " + IPAToHebrew.lookup(char).text)
                  return IPAToHebrew.lookup(char).text
                }
                
                // return !IPAToHebrew.lookup(`${char}(final)`).error
                //         ? i === word.length - 1
                //           ? IPAToHebrew.lookup(`${char}(final)`)
                //           : IPAToHebrew.lookup(char)
                //         : IPAToHebrew.lookup(char)
              }
            ).join('')
          }
        )

        HebrewText = HebrewText.join(' ')
        console.log(HebrewText)


        // Turn the array to a sentence, and update the DOM
        IPAText = IPAText.join(' ');

        


        // Make sure the output ID exists before outputting IPA
        if (typeof outID === 'string') {
          ConverterForm._updateTextArea(outID, HebrewText);
        } else {
          console.log("TextToIPA Warning: 'outID' in 'ConverterForm.convert()' is not a string, skipping IPA output.");
        }

        // Make sure the error exists before outputting errors
        if (typeof errID === 'string') {
          ConverterForm._updateParagraph(errID, currentErrorMessage + ' ' + currentMultiMessage);
        } else {
          console.log("TextToIPA Warning: 'errID' in 'ConverterForm.convert()' is not a string, skipping error output.");
        }

      }

    }

  };

}());
