import React from "react";
import { Selector } from "src/components/forms";
import { hasLength } from "src/utils";
import {
  LANG_EN_US,
  LANG_EN_US_STANDARD_C,
  VENDOR_AWS,
  VENDOR_CUSTOM,
  VENDOR_DEEPGRAM,
  VENDOR_GOOGLE,
  VENDOR_SONIOX,
  VENDOR_WELLSAID,
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
                vendor.value != VENDOR_DEEPGRAM &&
                vendor.value != VENDOR_SONIOX &&
                vendor.value !== VENDOR_CUSTOM
            )}
            onChange={(e) => {
              const vendor = e.target.value as keyof SynthesisVendors;
              setSynthVendor(vendor);

              /** When Custom Vendor is used, user you have to input the lange and voice. */
              if (vendor.toString().startsWith(VENDOR_CUSTOM)) {
                setSynthVoice("");
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
          {hasLength(ttsLabelOptions) && ttsLabelOptions.length > 1 && (
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
          {synthVendor &&
            !synthVendor.toString().startsWith(VENDOR_CUSTOM) &&
            synthLang && (
              <>
                <label htmlFor="synthesis_lang">Language</label>
                <Selector
                  id="synthesis_lang"
                  name="synthesis_lang"
                  value={synthLang}
                  options={synthesis[synthVendor as keyof SynthesisVendors].map(
                    (lang: VoiceLanguage) => ({
                      name: lang.name,
                      value: lang.code,
                    })
                  )}
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
                <Selector
                  id="synthesis_voice"
                  name="synthesis_voice"
                  value={synthVoice}
                  options={
                    synthesis[synthVendor as keyof SynthesisVendors]
                      .filter((lang: VoiceLanguage) => lang.code === synthLang)
                      .flatMap((lang: VoiceLanguage) =>
                        lang.voices.map((voice: Voice) => ({
                          name: voice.name,
                          value: voice.value,
                        }))
                      ) as Voice[]
                  }
                  onChange={(e) => setSynthVoice(e.target.value)}
                />
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
                vendor.value !== VENDOR_CUSTOM
            )}
            onChange={(e) => {
              const vendor = e.target.value as keyof RecognizerVendors;
              setRecogVendor(vendor);

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
            }}
          />
          {hasLength(sttLabelOptions) && sttLabelOptions.length > 1 && (
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
