import React, { useEffect, useRef, useState } from "react";
import {
  getGoogleCustomVoices,
  postSpeechServiceLanguages,
  postSpeechServiceVoices,
} from "src/api";
import { SpeechCredential } from "src/api/types";
import { Selector } from "src/components/forms";
import { SelectorOption } from "src/components/forms/selector";
import { useSelectState } from "src/store";
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
  useTtsModels,
} from "src/vendor";
import {
  LabelOptions,
  Language,
  RecognizerVendors,
  SynthesisVendors,
  VendorOptions,
  Voice,
  VoiceLanguage,
} from "src/vendor/types";
type SpeechProviderSelectionProbs = {
  accountSid: string;
  serviceProviderSid: string;
  credentials: SpeechCredential[] | undefined;
  synthesis: SynthesisVendors | undefined;
  ttsVendor: [
    keyof SynthesisVendors,
    React.Dispatch<React.SetStateAction<keyof SynthesisVendors>>
  ];
  ttsVendorOptions: VendorOptions[];
  ttsVoice: [string, React.Dispatch<React.SetStateAction<string>>];
  ttsLang: [string, React.Dispatch<React.SetStateAction<string>>];
  ttsLabelOptions: LabelOptions[];
  ttsLabel: [string, React.Dispatch<React.SetStateAction<string>>];
  recognizers: RecognizerVendors | undefined;
  sttVendor: [
    keyof RecognizerVendors,
    React.Dispatch<React.SetStateAction<keyof RecognizerVendors>>
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
  synthesis,
  ttsVendor: [synthVendor, setSynthVendor],
  ttsVendorOptions,
  ttsVoice: [synthVoice, setSynthVoice],
  ttsLang: [synthLang, setSynthLang],
  ttsLabelOptions,
  ttsLabel: [synthLabel, setSynthLabel],
  recognizers,
  sttVendor: [recogVendor, setRecogVendor],
  sttVendorOptions,
  sttLang: [recogLang, setRecogLang],
  sttLabelOptions,
  sttLabel: [recogLabel, setRecogLabel],
}: SpeechProviderSelectionProbs) => {
  const [selectedCredential, setSelectedCredential] = useState<
    SpeechCredential | undefined
  >();
  const [synthesisVoiceOptions, setSynthesisVoiceOptions] = useState<
    SelectorOption[]
  >([]);
  const [synthesisLanguageOptions, setSynthesisLanguageOptions] = useState<
    SelectorOption[]
  >([]);

  const currentServiceProvider = useSelectState("currentServiceProvider");

  const currentVendor = useRef(synthVendor);

  const ttsModels = useTtsModels();

  useEffect(() => {
    currentVendor.current = synthVendor;
    if (
      !synthesis ||
      synthVendor.startsWith("custom:") ||
      synthVendor === VENDOR_DEEPGRAM
    ) {
      return;
    }
    const voiceOpts = synthesis[synthVendor as keyof SynthesisVendors]
      .filter((lang: VoiceLanguage) => {
        // ELEVENLABS has same voice for all lange, take voices from the 1st language
        // Only first language has voices, the rest has empty voices
        if (synthVendor === VENDOR_ELEVENLABS && lang.voices.length > 0) {
          return true;
        }
        return lang.code === synthLang;
      })
      .flatMap((lang: VoiceLanguage) =>
        lang.voices.map((voice: Voice) => ({
          name: voice.name,
          value: voice.value,
        }))
      ) as Voice[];
    setSynthesisVoiceOptions(voiceOpts);

    const langOpts = synthesis[synthVendor as keyof SynthesisVendors].map(
      (lang: VoiceLanguage) => ({
        name: lang.name,
        value: lang.code,
      })
    );
    setSynthesisLanguageOptions(langOpts);

    if (synthVendor === VENDOR_ELEVENLABS) {
      postSpeechServiceVoices(
        currentServiceProvider
          ? currentServiceProvider.service_provider_sid
          : "",
        {
          vendor: synthVendor,
          label: synthLabel,
        }
      ).then(({ json }) => {
        // If after successfully fetching data, vendor is still good, then apply value
        if (currentVendor.current !== VENDOR_ELEVENLABS) {
          return;
        }
        if (json.length > 0) {
          setSynthesisVoiceOptions(json);
        }
      });

      postSpeechServiceLanguages(
        currentServiceProvider
          ? currentServiceProvider.service_provider_sid
          : "",
        {
          vendor: synthVendor,
          label: synthLabel,
        }
      ).then(({ json }) => {
        if (json.length > 0) {
          setSynthesisLanguageOptions(json);
        }
      });
    } else if (synthVendor === VENDOR_GOOGLE) {
      getGoogleCustomVoices({
        ...(synthLabel && { label: synthLabel }),
        account_sid: accountSid,
        service_provider_sid: serviceProviderSid,
      }).then(({ json }) => {
        // If after successfully fetching data, vendor is still good, then apply value
        if (currentVendor.current !== VENDOR_GOOGLE) {
          return;
        }
        const customVOices = json.map((v) => ({
          name: `${v.name} (Custom)`,
          value: `custom_${v.google_custom_voice_sid}`,
        }));
        const options = synthesis[synthVendor as keyof SynthesisVendors]
          .filter((lang: VoiceLanguage) => {
            return lang.code === synthLang;
          })
          .flatMap((lang: VoiceLanguage) =>
            lang.voices.map((voice: Voice) => ({
              name: voice.name,
              value: voice.value,
            }))
          ) as Voice[];
        setSynthesisVoiceOptions([...customVOices, ...options]);
        if (customVOices.length > 0) {
          setSynthVoice(customVOices[0].value);
        }
      });
    }
  }, [synthVendor, synthesis, synthLabel, accountSid, serviceProviderSid]);

  useEffect(() => {
    if (credentials) {
      setSelectedCredential(
        credentials.find(
          (c) => c.vendor === synthVendor && c.label === synthLabel
        )
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
  return (
    <>
      {synthesis && (
        <fieldset>
          <label htmlFor="synthesis_vendor">Speech synthesis vendor</label>
          <Selector
            id="synthesis_vendor"
            name="synthesis_vendor"
            value={synthVendor}
            options={ttsVendorOptions.filter(
              (vendor) =>
                vendor.value != VENDOR_ASSEMBLYAI &&
                vendor.value != VENDOR_SONIOX &&
                vendor.value !== VENDOR_CUSTOM &&
                vendor.value !== VENDOR_COBALT
            )}
            onChange={(e) => {
              const vendor = e.target.value as keyof SynthesisVendors;
              setSynthVendor(vendor);
              setSynthLabel("");

              /** When Custom Vendor is used, user you have to input the lange and voice. */
              if (vendor.toString().startsWith(VENDOR_CUSTOM)) {
                setSynthVoice("");
                return;
              }

              /** DEEPGRAM only support voice */
              if (vendor.toString().startsWith(VENDOR_DEEPGRAM)) {
                if (ttsModels) {
                  setSynthVoice(ttsModels[VENDOR_DEEPGRAM][0].value);
                }

                return;
              }

              /** When using Google and en-US, ensure "Standard-C" is used as default */
              if (
                e.target.value === VENDOR_GOOGLE &&
                synthLang === LANG_EN_US
              ) {
                setSynthVoice(LANG_EN_US_STANDARD_C);
                return;
              }

              if (vendor === VENDOR_ELEVENLABS) {
                // Samve Voices applied to all languages
                // Voices are only available for the 1st language.
                setSynthLang(ELEVENLABS_LANG_EN);
                setSynthVoice(synthesis[vendor][0].voices[0].value);
                return;
              }

              if (vendor === VENDOR_WHISPER) {
                const newLang = synthesis[vendor].find(
                  (lang) => lang.code === LANG_EN_US
                );
                setSynthLang(LANG_EN_US);
                setSynthVoice(newLang!.voices[0].value);
                return;
              }

              /** Google and AWS have different language lists */
              /** If the new language doesn't map then default to "en-US" */
              let newLang = synthesis[vendor].find(
                (lang) => lang.code === synthLang
              );

              if (newLang) {
                setSynthVoice(newLang.voices[0].value);
                return;
              }

              newLang = synthesis[vendor].find(
                (lang) => lang.code === LANG_EN_US
              );

              setSynthLang(LANG_EN_US);
              setSynthVoice(newLang!.voices[0].value);
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
                  setSynthLabel(e.target.value);
                }}
              />
            </>
          )}
          {ttsModels && synthVendor === VENDOR_DEEPGRAM && (
            <>
              <label htmlFor="synthesis_lang">Model</label>
              <Selector
                id="synthesis_voice"
                name="synthesis_voice"
                value={synthVoice}
                options={ttsModels[synthVendor]}
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
                  options={synthesisLanguageOptions}
                  onChange={(e) => {
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

                    const newLang = synthesis[
                      synthVendor as keyof SynthesisVendors
                    ].find((lang) => lang.code === language);

                    setSynthVoice(newLang!.voices[0].value);
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
                    options={synthesisVoiceOptions}
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
      )}
      {recognizers && (
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
                vendor.value !== VENDOR_CUSTOM
            )}
            onChange={(e) => {
              const vendor = e.target.value as keyof RecognizerVendors;
              setRecogVendor(vendor);
              setRecogLabel("");

              /**When vendor is custom, Language is input by user */
              if (vendor.toString() === VENDOR_CUSTOM) return;

              /** Google and AWS have different language lists */
              /** If the new language doesn't map then default to "en-US" */
              const newLang = recognizers[vendor].find(
                (lang: Language) => lang.code === recogLang
              );

              if (
                (vendor === VENDOR_GOOGLE || vendor === VENDOR_AWS) &&
                !newLang
              ) {
                setRecogLang(LANG_EN_US);
              }
              // Default colbalt language
              if (vendor === VENDOR_COBALT) {
                setRecogLang(LANG_COBALT_EN_US);
              }
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
                  options={recognizers[
                    recogVendor as keyof RecognizerVendors
                  ].map((lang: Language) => ({
                    name: lang.name,
                    value: lang.code,
                  }))}
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
      )}
    </>
  );
};

export default SpeechProviderSelection;
