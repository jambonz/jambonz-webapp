import React, { useEffect, useRef, useState } from "react";
import {
  getGoogleCustomVoices,
  getSpeechSupportedLanguagesAndVoices,
} from "src/api";
import { USER_ADMIN } from "src/api/constants";
import {
  SpeechCredential,
  SpeechSupportedLanguagesAndVoices,
} from "src/api/types";
import { Selector } from "src/components/forms";
import { SelectorOption } from "src/components/forms/selector";
import { toastError, useSelectState } from "src/store";
import { hasLength } from "src/utils";
import {
  ELEVENLABS_LANG_EN,
  LANG_COBALT_EN_US,
  LANG_EN_US,
  LANG_EN_US_STANDARD_C,
  VENDOR_AWS,
  VENDOR_COBALT,
  VENDOR_CUSTOM,
  VENDOR_DEEPGRAM,
  VENDOR_ASSEMBLYAI,
  VENDOR_ELEVENLABS,
  VENDOR_GOOGLE,
  VENDOR_MICROSOFT,
  VENDOR_SONIOX,
  VENDOR_WELLSAID,
  VENDOR_WHISPER,
  VENDOR_SPEECHMATICS,
  VENDOR_PLAYHT,
  VENDOR_CARTESIA,
  VENDOR_VOXIST,
} from "src/vendor";
import {
  LabelOptions,
  RecognizerVendors,
  SynthesisVendors,
  VendorOptions,
} from "src/vendor/types";
type SpeechProviderSelectionProbs = {
  accountSid: string;
  serviceProviderSid: string;
  credentials: SpeechCredential[] | undefined;
  ttsVendor: [
    keyof SynthesisVendors,
    React.Dispatch<React.SetStateAction<keyof SynthesisVendors>>,
  ];
  ttsVendorOptions: VendorOptions[];
  ttsVoice: [string, React.Dispatch<React.SetStateAction<string>>];
  ttsLang: [string, React.Dispatch<React.SetStateAction<string>>];
  ttsLabelOptions: LabelOptions[];
  ttsLabel: [string, React.Dispatch<React.SetStateAction<string>>];
  sttVendor: [
    keyof RecognizerVendors,
    React.Dispatch<React.SetStateAction<keyof RecognizerVendors>>,
  ];
  sttVendorOptions: VendorOptions[];
  sttLang: [string, React.Dispatch<React.SetStateAction<string>>];
  sttLabelOptions: LabelOptions[];
  sttLabel: [string, React.Dispatch<React.SetStateAction<string>>];
};

export const SpeechProviderSelection = ({
  accountSid,
  serviceProviderSid,
  credentials,
  ttsVendor: [synthVendor, setSynthVendor],
  ttsVendorOptions,
  ttsVoice: [synthVoice, setSynthVoice],
  ttsLang: [synthLang, setSynthLang],
  ttsLabelOptions,
  ttsLabel: [synthLabel, setSynthLabel],
  sttVendor: [recogVendor, setRecogVendor],
  sttVendorOptions,
  sttLang: [recogLang, setRecogLang],
  sttLabelOptions,
  sttLabel: [recogLabel, setRecogLabel],
}: SpeechProviderSelectionProbs) => {
  const user = useSelectState("user");
  const [
    synthesisSupportedLanguagesAndVoices,
    setSynthesisSupportedLanguagesAndVoices,
  ] = useState<SpeechSupportedLanguagesAndVoices | null>();
  const [selectedCredential, setSelectedCredential] = useState<
    SpeechCredential | undefined
  >();
  const [synthesisVoiceOptions, setSynthesisVoiceOptions] = useState<
    SelectorOption[]
  >([]);
  const [synthesisLanguageOptions, setSynthesisLanguageOptions] = useState<
    SelectorOption[]
  >([]);
  const [synthesisModelOptions, setSynthesisModelOptions] = useState<
    SelectorOption[]
  >([]);
  const [
    synthesisGoogleCustomVoiceOptions,
    setSynthesisGoogleCustomVoiceOptions,
  ] = useState<SelectorOption[]>([]);
  const [recogLanguageOptions, setRecogLanguageOptions] = useState<
    SelectorOption[]
  >([]);

  const currentTtsVendor = useRef(synthVendor);
  const currentSttVendor = useRef(recogVendor);
  const shouldUpdateTtsVoice = useRef(false);
  const shouldUpdateSttLanguage = useRef(false);
  const ttsEffectTimer = useRef<number | null>(null);
  const sttEffectTimer = useRef<number | null>(null);

  // Get Synthesis languages and voices
  useEffect(() => {
    if (
      !user ||
      !synthVendor ||
      (user?.scope === USER_ADMIN && !serviceProviderSid)
    ) {
      return;
    }
    currentTtsVendor.current = synthVendor;
    /** When Custom Vendor is used, user you have to input the lange and voice. */
    if (synthVendor.toString().startsWith(VENDOR_CUSTOM)) {
      setSynthVoice("");
      return;
    }
    // just execute last change
    if (ttsEffectTimer.current) {
      clearTimeout(ttsEffectTimer.current);
    }

    ttsEffectTimer.current = setTimeout(() => {
      configSynthesis();
    }, 200);
  }, [synthVendor, synthLabel, serviceProviderSid]);

  // Get Recognizer languages and voices
  useEffect(() => {
    /** When Custom Vendor is used, user you have to input the lange and voice. */
    if (recogVendor.toString().startsWith(VENDOR_CUSTOM)) {
      setRecogLang(LANG_EN_US);
      return;
    }
    if (
      !user ||
      !recogVendor ||
      (user?.scope === USER_ADMIN && !serviceProviderSid)
    ) {
      return;
    }
    currentSttVendor.current = recogVendor;
    // just execute last change
    if (sttEffectTimer.current) {
      clearTimeout(sttEffectTimer.current);
    }

    sttEffectTimer.current = setTimeout(() => {
      configRecognizer();
    }, 200);
  }, [recogVendor, recogLabel, serviceProviderSid]);

  useEffect(() => {
    if (credentials) {
      setSelectedCredential(
        credentials.find(
          (c) => c.vendor === synthVendor && (c.label || "") === synthLabel,
        ),
      );
    }
  }, [synthVendor, synthLabel, credentials]);

  useEffect(() => {
    if (!synthLabel && ttsLabelOptions?.length > 0) {
      setSynthLabel(ttsLabelOptions[0].value);
    }
    if (!recogLabel && sttLabelOptions?.length > 0) {
      setRecogLabel(sttLabelOptions[0].value);
    }
  }, [ttsLabelOptions, sttLabelOptions]);

  useEffect(() => {
    if (synthesisSupportedLanguagesAndVoices) {
      // Extract Voice
      const voicesOpts =
        synthesisSupportedLanguagesAndVoices.tts?.find((lang) => {
          if (synthVendor === VENDOR_ELEVENLABS && lang.voices.length > 0) {
            return true;
          }
          return lang.value === synthLang;
        })?.voices || [];

      if (synthVendor === VENDOR_GOOGLE && synthesisGoogleCustomVoiceOptions) {
        if (synthesisGoogleCustomVoiceOptions) {
          setSynthesisVoiceOptions([
            ...synthesisGoogleCustomVoiceOptions,
            ...voicesOpts,
          ]);
        } else {
          setSynthesisVoiceOptions(voicesOpts);
        }
        if (synthesisGoogleCustomVoiceOptions.length > 0) {
          updateTtsVoice(synthesisGoogleCustomVoiceOptions[0].value);
        }
      }
      // PlayHT3.0 all voices are listed under english language, all voices can be used for multiple languages
      else if (
        synthVendor === VENDOR_PLAYHT &&
        synthesisSupportedLanguagesAndVoices.tts.some(
          (l) => l.value === "english",
        )
      ) {
        setSynthesisVoiceOptions(
          synthesisSupportedLanguagesAndVoices.tts.find(
            (tts) => tts.value === "english",
          )!.voices,
        );
      } else {
        setSynthesisVoiceOptions(voicesOpts);
      }
    }
  }, [
    synthLang,
    synthesisSupportedLanguagesAndVoices,
    synthesisGoogleCustomVoiceOptions,
  ]);

  const configSynthesis = () => {
    getSpeechSupportedLanguagesAndVoices(
      serviceProviderSid,
      synthVendor,
      synthLabel,
    )
      .then(({ json }) => {
        // while fetching data, user might change the vendor
        if (currentTtsVendor.current !== synthVendor) {
          return;
        }
        setSynthesisSupportedLanguagesAndVoices(json);
        // Extract model
        if (json.models && json.models.length) {
          setSynthesisModelOptions(json.models);
          if (synthVendor === VENDOR_DEEPGRAM) {
            setSynthVoice(json.models[0].value);
            return;
          }
        }

        if (json.tts && json.tts.length) {
          // Extract Language
          const langOpts = json.tts.map((lang) => ({
            name: lang.name,
            value: lang.value,
          }));
          setSynthesisLanguageOptions(langOpts);

          // Default setting
          const googleLang = json.tts.find((lang) => lang.value === synthLang);
          if (
            synthVendor === VENDOR_GOOGLE &&
            (!googleLang ||
              !googleLang.voices.find((v) => v.value === synthVoice))
          ) {
            setSynthLang(LANG_EN_US);
            updateTtsVoice(LANG_EN_US_STANDARD_C);
            return;
          }
          if (synthVendor === VENDOR_ELEVENLABS) {
            // Samve Voices applied to all languages
            // Voices are only available for the 1st language.
            setSynthLang(ELEVENLABS_LANG_EN);
            updateTtsVoice(json.tts[0].voices[0].value);
            return;
          }
          if (synthVendor === VENDOR_WHISPER) {
            const newLang = json.tts.find((lang) => lang.value === LANG_EN_US);
            setSynthLang(LANG_EN_US);
            updateTtsVoice(newLang!.voices[0].value);
            return;
          }
          if (synthVendor === VENDOR_PLAYHT) {
            const newLang = json.tts.find(
              (lang) => lang.value === LANG_EN_US || lang.value === "english",
            );
            setSynthLang(newLang!.value);
            updateTtsVoice(newLang!.voices[0].value);
            return;
          }
          if (synthVendor === VENDOR_CARTESIA) {
            const newLang = json.tts.find((lang) => lang.value === "en");
            setSynthLang(newLang!.value);
            updateTtsVoice(newLang!.voices[0].value);
            return;
          }
          /** Google and AWS have different language lists */
          /** If the new language doesn't map then default to "en-US" */
          let newLang = json.tts.find((lang) => lang.value === synthLang);

          if (newLang) {
            updateTtsVoice(newLang.voices[0].value);
            return;
          }

          newLang = json.tts.find((lang) => lang.value === LANG_EN_US);

          setSynthLang(LANG_EN_US);
          updateTtsVoice(newLang!.voices[0].value);
        }
      })
      .catch((error) => {
        toastError(error.msg);
      });

    if (synthVendor === VENDOR_GOOGLE) {
      getGoogleCustomVoices({
        ...(synthLabel && { label: synthLabel }),
        account_sid: accountSid,
        service_provider_sid: serviceProviderSid,
      }).then(({ json }) => {
        // If after successfully fetching data, vendor is still good, then apply value
        if (currentTtsVendor.current !== VENDOR_GOOGLE) {
          return;
        }
        const customVOices = json.map((v) => ({
          name: `${v.name} (Custom)`,
          value: `custom_${v.google_custom_voice_sid}`,
        }));
        setSynthesisGoogleCustomVoiceOptions(customVOices);
      });
    }
  };

  const updateTtsVoice = (value: string) => {
    if (shouldUpdateTtsVoice.current) {
      setSynthVoice(value);
      shouldUpdateTtsVoice.current = false;
    }
  };

  const configRecognizer = () => {
    getSpeechSupportedLanguagesAndVoices(
      serviceProviderSid,
      recogVendor,
      recogLabel,
    )
      .then(({ json }) => {
        // while fetching data, the user might change the vendor
        if (currentSttVendor.current !== recogVendor) {
          return;
        }
        // Extract Language
        const langOpts = json.stt.map((lang) => ({
          name: lang.name,
          value: lang.value,
        }));
        setRecogLanguageOptions(langOpts);

        /**When vendor is custom, Language is input by user */
        if (
          recogVendor.toString() === VENDOR_CUSTOM ||
          !shouldUpdateSttLanguage.current
        )
          return;
        shouldUpdateSttLanguage.current = false;
        /** Google and AWS have different language lists */
        /** If the new language doesn't map then default to "en-US" */
        const newLang = json.stt.find((lang) => lang.value === recogLang);

        if (
          (recogVendor === VENDOR_GOOGLE || recogVendor === VENDOR_AWS) &&
          !newLang
        ) {
          setRecogLang(LANG_EN_US);
        } else if (recogVendor === VENDOR_COBALT && !newLang) {
          setRecogLang(LANG_COBALT_EN_US);
        } else if (langOpts.length && !newLang) {
          setRecogLang(langOpts[0].value);
        }
      })
      .catch((error) => {
        toastError(error.msg);
      });
  };
  return (
    <>
      <fieldset>
        <label htmlFor="synthesis_vendor">Speech synthesis vendor</label>
        <Selector
          id="synthesis_vendor"
          name="synthesis_vendor"
          value={synthVendor}
          options={ttsVendorOptions.filter(
            (vendor) =>
              vendor.value !== VENDOR_ASSEMBLYAI &&
              vendor.value !== VENDOR_VOXIST &&
              vendor.value !== VENDOR_SONIOX &&
              vendor.value !== VENDOR_SPEECHMATICS &&
              vendor.value !== VENDOR_CUSTOM &&
              vendor.value !== VENDOR_COBALT,
          )}
          onChange={(e) => {
            const vendor = e.target.value as keyof SynthesisVendors;
            shouldUpdateTtsVoice.current = true;
            setSynthVendor(vendor);
            setSynthLabel("");
            setSynthesisLanguageOptions([]);
            setSynthesisVoiceOptions([]);
          }}
        />
        {hasLength(ttsLabelOptions) && (
          <>
            <label htmlFor="synthesis_label">Label</label>
            <Selector
              id="systhesis_label"
              name="systhesis_label"
              value={synthLabel}
              options={ttsLabelOptions}
              onChange={(e) => {
                shouldUpdateTtsVoice.current = true;
                setSynthLabel(e.target.value);
              }}
            />
          </>
        )}
        {synthesisModelOptions && synthVendor === VENDOR_DEEPGRAM && (
          <>
            <label htmlFor="synthesis_lang">Model</label>
            <Selector
              id="synthesis_voice"
              name="synthesis_voice"
              value={synthVoice}
              options={synthesisModelOptions}
              onChange={(e) => setSynthVoice(e.target.value)}
            />
          </>
        )}
        {synthVendor &&
          !synthVendor.toString().startsWith(VENDOR_CUSTOM) &&
          synthVendor !== VENDOR_DEEPGRAM &&
          synthLang && (
            <>
              <label htmlFor="synthesis_lang">Language</label>
              <Selector
                id="synthesis_lang"
                name="synthesis_lang"
                value={synthLang}
                options={synthesisLanguageOptions.sort((a, b) =>
                  a.name.localeCompare(b.name),
                )}
                onChange={(e) => {
                  shouldUpdateTtsVoice.current = true;
                  const language = e.target.value;
                  setSynthLang(language);

                  /** When using Google and en-US, ensure "Standard-C" is used as default */
                  if (
                    synthVendor === VENDOR_GOOGLE &&
                    language === LANG_EN_US
                  ) {
                    setSynthVoice(LANG_EN_US_STANDARD_C);
                    return;
                  }

                  const voices =
                    synthesisSupportedLanguagesAndVoices?.tts.find(
                      (lang) => lang.value === language,
                    )?.voices || [];
                  if (
                    synthVendor === VENDOR_GOOGLE &&
                    synthesisGoogleCustomVoiceOptions &&
                    synthesisGoogleCustomVoiceOptions.length
                  ) {
                    setSynthesisVoiceOptions([
                      ...synthesisGoogleCustomVoiceOptions,
                      ...voices,
                    ]);
                  } else {
                    setSynthesisVoiceOptions(voices);
                  }

                  setSynthVoice(voices[0].value);
                }}
              />
              <label htmlFor="synthesis_voice">Voice</label>
              {synthVendor === VENDOR_MICROSOFT &&
              selectedCredential &&
              selectedCredential.use_custom_tts ? (
                <input
                  id="custom_microsoft_synthesis_voice"
                  type="text"
                  name="custom_microsoft_synthesis_voice"
                  placeholder="Required"
                  required
                  value={synthVoice}
                  onChange={(e) => {
                    setSynthVoice(e.target.value);
                  }}
                />
              ) : (
                <Selector
                  id="synthesis_voice"
                  name="synthesis_voice"
                  value={synthVoice}
                  options={synthesisVoiceOptions.sort((a, b) =>
                    a.name.localeCompare(b.name),
                  )}
                  onChange={(e) => setSynthVoice(e.target.value)}
                />
              )}
            </>
          )}
        {synthVendor.toString().startsWith(VENDOR_CUSTOM) && (
          <>
            <label htmlFor="custom_vendor_synthesis_lang">Language</label>
            <input
              id="custom_vendor_synthesis_lang"
              type="text"
              name="custom_vendor_synthesis_lang"
              placeholder="Required"
              required
              value={synthLang}
              onChange={(e) => {
                setSynthLang(e.target.value);
              }}
            />

            <label htmlFor="custom_vendor_synthesis_voice">Voice</label>
            <input
              id="custom_vendor_synthesis_voice"
              type="text"
              name="custom_vendor_synthesis_voice"
              placeholder="Required"
              required
              value={synthVoice}
              onChange={(e) => {
                setSynthVoice(e.target.value);
              }}
            />
          </>
        )}
      </fieldset>
      <fieldset>
        <label htmlFor="recognizer_vendor">Speech recognizer vendor</label>
        <Selector
          id="recognizer_vendor"
          name="recognizer_vendor"
          value={recogVendor}
          options={sttVendorOptions.filter(
            (vendor) =>
              vendor.value != VENDOR_WELLSAID &&
              vendor.value != VENDOR_ELEVENLABS &&
              vendor.value != VENDOR_WHISPER &&
              vendor.value !== VENDOR_CUSTOM,
          )}
          onChange={(e) => {
            const vendor = e.target.value as keyof RecognizerVendors;
            shouldUpdateSttLanguage.current = true;
            setRecogVendor(vendor);
            setRecogLabel("");

            setRecogLanguageOptions([]);
          }}
        />
        {hasLength(sttLabelOptions) && (
          <>
            <label htmlFor="recog_label">Label</label>
            <Selector
              id="recog_label"
              name="recog_label"
              value={recogLabel}
              options={sttLabelOptions}
              onChange={(e) => {
                setRecogLabel(e.target.value);
              }}
            />
          </>
        )}
        {recogVendor &&
          !recogVendor.toString().startsWith(VENDOR_CUSTOM) &&
          recogLang && (
            <>
              <label htmlFor="recognizer_lang">Language</label>
              <Selector
                id="recognizer_lang"
                name="recognizer_lang"
                value={recogLang}
                options={recogLanguageOptions}
                onChange={(e) => {
                  setRecogLang(e.target.value);
                }}
              />
            </>
          )}
        {recogVendor.toString().startsWith(VENDOR_CUSTOM) && (
          <>
            <label htmlFor="custom_vendor_recognizer_voice">Language</label>
            <input
              id="custom_vendor_recognizer_voice"
              type="text"
              name="custom_vendor_recognizer_voice"
              placeholder="Required"
              required
              value={recogLang}
              onChange={(e) => {
                setRecogLang(e.target.value);
              }}
            />
          </>
        )}
      </fieldset>
    </>
  );
};

export default SpeechProviderSelection;
