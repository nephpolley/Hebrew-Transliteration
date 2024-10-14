//  ipa-to-hebrew.js
//  Adaptation of text-to-ipa.js

//  This file creates a global IPAToHebrew object containing the public loadDict
//  and lookup methods as well as the associated private helper objects and methods.

//  The purpose of this program is to look up an english word in an english-to-ipa
//  dictionary via lookup() and return an IPAWord to tell if an english word
//  has multiple IPA pronunciations, as well as the IPA text itself (pronunciations
//  included).

//      IPAToHebrew.loadDict(location)
//          location    Location to load the dictionary from. Since it's gotten
//                      with an XMLHttpRequest, it can be on the local machine or
//                      remote
//          This method produces no output, but will take the location of the
//          dictionary and parse it into the _IPADict object for fast lookups
//          with the lookup method. This method _NEEDS_ to be ran before lookup(),
//          so ideally you would want to run this when the window loads.

//      IPAToHebrew.lookup(word)
//          word        English word that will be searched for in the IPA Dict
//          This method returns an IPAWord that has an error attribute, and
//          a text attribute. The error determines if the word exists in IPA,
//          if the word has multiple pronunciations. The text is the resulting
//          IPA text of the lookup. See converter-form.js for how to utilize this.

// Create a IPAToHebrew object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.
if (typeof IPAToHebrew !== 'object') {
  IPAToHebrew = {};
}

(function () {
  'use strict';

  // Objects

  // Create the ipadict if one does not currently exist. This is important,
  // as reloading the dict takes long, so if one already exists, let it be.
  if (typeof IPAToHebrew._HebrewDict !== 'object') {
    IPAToHebrew._HebrewDict = {};
  }

  // Create a constructor for an IPAWord that makes displaying them and
  // associated errors much easier.
  // NOTE: This need not exist outside this program.
  function HebrewWord(error, text) {
    this.error = error;
    this.text = text;
  }

  // Functions

  if (typeof IPAToHebrew._parseDict !== 'function') {
    IPAToHebrew._parseDict = function (lines) {
      console.log('IPAToHebrew: Beginning parsing to dict...');

      // Fill out the Hebrew dict by
      // 1) regexing the word and it's corresponding Hebrew translation into an array
      // 2) using the word as the key and the Hebrew result as the pair
      for (var i in lines) {
          var arr = lines[i].split(/\s+/g);
          IPAToHebrew._HebrewDict[arr[0]] = arr[1];
      }

      console.log('IPAToHebrew: Done parsing.');
    };
  }

  // Load the dictionary. Can be on the local machine or from a GET request.
  if (typeof IPAToHebrew.loadDict !== 'function') {
    IPAToHebrew.loadDict = function (location) {
      console.log('IPAToHebrew: Loading dict from ' + location + '...');

      if (typeof location !== 'string') {
        console.log('IPAToHebrew Error: Location is not valid!');
      } else {

        var txtFile = new XMLHttpRequest();

        txtFile.open('GET', location, true);

        txtFile.onreadystatechange = function() {
          // If document is ready to parse...
          if (txtFile.readyState == 4) {
            // And file is found...
            if (txtFile.status == 200 || txtFile.status == 0) {
              // Load up the Hebrew dict
              IPAToHebrew._parseDict(txtFile.responseText.split("\n"));
            }
          }
        }

        txtFile.send(null);

      }

    };

  }

  // Lookup function to find an english word's corresponding IPA text
  if (typeof IPAToHebrew.lookup !== 'function') {

    IPAToHebrew.lookup = function (word) {

      if (Object.keys(IPAToHebrew._HebrewDict).length === 0) {
        console.log("IPAToHebrew Error: No data in IPAToHebrew._HebrewDict. Did 'IPAToHebrew.loadDict()' run?");
      } else {
        // It is possible to return undefined, so that case should not be ignored
        if ( typeof IPAToHebrew._HebrewDict[word] != "undefined" ) {

          // Some words in english have multiple pronunciations (maximum of 4 in this dictionary)
          // Therefore we use a trick to get all of them

          // Resulting error, null since we don't know if this word has multiple
          // pronunciations
          var error = null;
          // Text, defaults to the IPA word. We build on this if multiple
          // pronunciations exist
          var text = IPAToHebrew._HebrewDict[word];

          // Iterate from 1 - 3. There are no more than 3 extra pronunciations.
          for (var i = 1; i < 4; i++) {
            // See if pronunciation i exists...
            if ( typeof IPAToHebrew._HebrewDict[word + '(' + i + ')'] != "undefined" ) {
              // ...If it does we know that the error should be multi and the text
              // is always itself plus the new pronunciation
              error = 'multi';
              text += ' OR ' + IPAToHebrew._HebrewDict[word + '(' + i + ')'];
            // ...Otherwise no need to keep iterating
            } else {
              break;
            }
          }

          // Return the new word
          return new HebrewWord(error, text);

        } else {
          return new HebrewWord("undefined", word);
        }

      }

    };

  }

}());

// Load dict
// Could be intensive, might only want to load when necessary
window.onload = IPAToHebrew.loadDict('./assets/hebrewdict.txt');