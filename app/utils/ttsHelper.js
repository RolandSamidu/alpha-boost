import { Alert, Platform } from "react-native";

let Speech = null;
try {
  Speech = require("expo-speech");
} catch (error) {
  console.log("expo-speech not available:", error.message);
}

let Audio = null;
try {
  const { Audio: ExpoAudio } = require("expo-av");
  Audio = ExpoAudio;
} catch (error) {
  console.log("expo-av not available:", error.message);
}

class TTSHelper {
  static isInitialized = false;

  static async initialize() {
    this.isInitialized = true;

    const hasExpoSpeech = Speech && Speech.speak;
    const hasWebSpeech =
      typeof window !== "undefined" && window.speechSynthesis;
    const hasExpoAV = Audio && Audio.setAudioModeAsync;

    console.log(`TTS Environment Check:
    - Platform: ${Platform.OS}
    - Expo Speech: ${hasExpoSpeech ? "Available" : "Not Available"}
    - Web Speech: ${hasWebSpeech ? "Available" : "Not Available"}  
    - Expo AV: ${hasExpoAV ? "Available" : "Not Available"}`);

    if (hasExpoSpeech) {
      console.log("TTS Helper initialized with Expo Speech API");
    } else if (hasWebSpeech) {
      console.log("TTS Helper initialized with Web Speech API");
    } else {
      console.log("TTS Helper initialized with Enhanced Text Dialogs");
    }

    if (hasExpoAV) {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.log("Audio mode setup failed:", error);
      }
    }
  }

  static async speak(text) {
    if (!text) return;

    console.log(`\n🔊 TTS Speak Request for: "${text}"`);
    console.log(`Platform: ${Platform.OS}`);

    try {
      if (Speech && Speech.speak) {
        console.log("✅ Attempting Expo Speech API...");

        try {
          const options = {
            language: "en-US",
            pitch: 1.0,
            rate: 0.6,
            voice: undefined,
          };

          await Speech.speak(text, options);
          console.log("✅ Expo Speech succeeded!");
          return true;
        } catch (speechError) {
          console.log("❌ Expo Speech failed:", speechError);
        }
      } else {
        console.log("❌ Expo Speech not available");
      }

      if (typeof window !== "undefined" && window.speechSynthesis) {
        console.log("✅ Attempting Web Speech API...");
        return this.speakWithWebAPI(text);
      } else {
        console.log(
          "❌ Web Speech API not available (window or speechSynthesis missing)"
        );
      }

      console.log("📱 Using enhanced text dialog as fallback");
      this.showEnhancedTextDialog(text);
      return false;
    } catch (error) {
      console.log("❌ TTS speak completely failed:", error);
      this.showEnhancedTextDialog(text);
      return false;
    }
  }

  static fallbackToWebAPI(text) {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      this.speakWithWebAPI(text);
    } else {
      this.showEnhancedTextDialog(text);
    }
  }

  static speakWithWebAPI(text) {
    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = "en-US";

      utterance.onstart = () => console.log("Web Speech started for:", text);
      utterance.onend = () => console.log("Web Speech completed for:", text);
      utterance.onerror = (event) => {
        console.log("Web Speech error:", event.error);
        this.showEnhancedTextDialog(text);
      };

      window.speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.log("Web Speech API failed:", error);
      this.showEnhancedTextDialog(text);
      return false;
    }
  }

  static showEnhancedTextDialog(text) {
    const phonetic = this.createPhoneticGuide(text);

    Alert.alert(
      "🔊 Word Pronunciation",
      `📝 Word: "${text}"\n\n🗣️ Say it like: "${phonetic}"\n\n💡 Tips:\n• Break it into syllables\n• Say each part slowly\n• Then speed up\n\n🎯 Practice saying it aloud 3 times!`,
      [
        {
          text: "Practice More",
          style: "default",
          onPress: () => this.showPracticeTips(text),
        },
        {
          text: "Got it!",
          style: "cancel",
        },
      ]
    );
  }

  static showPracticeTips(text) {
    const syllables = this.breakIntoSyllables(text);
    Alert.alert(
      "🎯 Practice Guide",
      `Word: "${text}"\n\n📚 Syllable breakdown:\n"${syllables}"\n\n🎵 Practice rhythm:\n• Clap for each syllable\n• Say each part clearly\n• Put them together`,
      [{ text: "Ready!", style: "default" }]
    );
  }

  static createPhoneticGuide(word) {
    const phoneticMap = {
      tion: "shun",
      sion: "zhun",
      ph: "f",
      gh: "f",
      ch: "ch",
      th: "th",
      qu: "kw",
      ough: "uff",
    };

    let phonetic = word.toLowerCase();

    for (const [pattern, replacement] of Object.entries(phoneticMap)) {
      phonetic = phonetic.replace(new RegExp(pattern, "g"), replacement);
    }

    return phonetic.charAt(0).toUpperCase() + phonetic.slice(1);
  }

  static breakIntoSyllables(word) {
    const vowels = "aeiouAEIOU";
    const syllables = [];
    let currentSyllable = "";

    for (let i = 0; i < word.length; i++) {
      currentSyllable += word[i];

      if (
        vowels.includes(word[i]) &&
        i < word.length - 1 &&
        !vowels.includes(word[i + 1])
      ) {
        let j = i + 1;
        while (j < word.length && !vowels.includes(word[j])) {
          j++;
        }
        if (j < word.length) {
          syllables.push(currentSyllable);
          currentSyllable = "";
        }
      }
    }

    if (currentSyllable) {
      syllables.push(currentSyllable);
    }

    return syllables.length > 1 ? syllables.join("-") : word;
  }

  static async stop() {
    try {
      if (Speech && Speech.stop) {
        await Speech.stop();
      }

      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    } catch (error) {
      console.log("TTS stop failed:", error);
    }
  }

  static async getAvailableVoices() {
    try {
      if (Speech && Speech.getAvailableVoicesAsync) {
        const voices = await Speech.getAvailableVoicesAsync();
        console.log("Available voices:", voices.length);
        return voices;
      }
      return [];
    } catch (error) {
      console.log("Failed to get voices:", error);
      return [];
    }
  }
}

export default TTSHelper;
