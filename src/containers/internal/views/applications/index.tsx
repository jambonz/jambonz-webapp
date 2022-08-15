import React, { useEffect, useState } from "react";
import { H1, P } from "jambonz-ui";

import { Section } from "src/components";
import { Selector } from "src/components/forms";
import {
  vendors,
  LANG_EN_US,
  VENDOR_GOOGLE,
  LANG_EN_US_STANDARD_C,
  VENDOR_AWS,
} from "src/vendor";

import type {
  RecognizerVendors,
  SynthesisVendors,
  Voice,
} from "src/vendor/types";

export const Applications = () => {
  const [synthesis, setSynthesis] = useState<SynthesisVendors | null>(null);
  const [recognizers, setRecognizers] = useState<RecognizerVendors | null>(
    null
  );
  const [vendorSynth, setVendorSynth] =
    useState<keyof SynthesisVendors>(VENDOR_GOOGLE);
  const [vendorRecog, setVendorRecog] =
    useState<keyof RecognizerVendors>(VENDOR_GOOGLE);
  const [langSynth, setLangSynth] = useState(LANG_EN_US);
  const [langRecog, setLangRecog] = useState(LANG_EN_US);
  const [voice, setVoice] = useState(LANG_EN_US_STANDARD_C);

  /** Lazy-load large data schemas -- e.g. code-splitting */
  /** This code should be moved into the add/edit form handling */
  useEffect(() => {
    let ignore = false;

    Promise.all([
      import("src/vendor/speech-recognizer/aws-speech-recognizer-lang"),
      import("src/vendor/speech-recognizer/google-speech-recognizer-lang"),
      import("src/vendor/speech-recognizer/ms-speech-recognizer-lang"),
      import("src/vendor/speech-synthesis/aws-speech-synthesis-lang"),
      import("src/vendor/speech-synthesis/google-speech-synthesis-lang"),
      import("src/vendor/speech-synthesis/ms-speech-synthesis-lang"),
      import("src/vendor/speech-synthesis/wellsaid-speech-synthesis-lang"),
    ]).then(
      ([
        { default: awsRecognizer },
        { default: googleRecognizer },
        { default: msRecognizer },
        { default: awsSynthesis },
        { default: googleSynthesis },
        { default: msSynthesis },
        { default: wellsaidSynthesis },
      ]) => {
        if (!ignore) {
          setSynthesis({
            aws: awsSynthesis,
            google: googleSynthesis,
            microsoft: msSynthesis,
            wellsaid: wellsaidSynthesis,
          });
          setRecognizers({
            aws: awsRecognizer,
            google: googleRecognizer,
            microsoft: msRecognizer,
          });
        }
      }
    );

    return function cleanup() {
      ignore = true;
    };
  }, []);

  return (
    <>
      <H1>Applications</H1>
      <Section slim>
        <form>
          <fieldset>
            <P>Example of lazy loading speech data files for add/edit form.</P>
            <P>
              This also shows how to implement the speech selector logic for
              vendors.
            </P>
            <P>
              Selected synthesis vendor:{" "}
              <strong>{vendorSynth || "undefined"}</strong>.
            </P>
            <P>
              Selected synthesis language:{" "}
              <strong>{langSynth || "undefined"}</strong>.
            </P>
            <P>
              Selected synthesis voice: <strong>{voice || "undefined"}</strong>.
            </P>
          </fieldset>
          {synthesis && (
            <>
              <fieldset>
                <label htmlFor="synthesis_vendor">
                  Speech Synthesis Vendor
                </label>
                <Selector
                  id="synthesis_vendor"
                  name="synthesis_vendor"
                  value={vendorSynth}
                  options={vendors}
                  onChange={(e) => {
                    const vendor = e.target.value as keyof SynthesisVendors;
                    setVendorSynth(vendor);

                    /** When using Google and en-US, ensure "Standard-C" is used as default */
                    if (
                      e.target.value === VENDOR_GOOGLE &&
                      langSynth === LANG_EN_US
                    ) {
                      setVoice(LANG_EN_US_STANDARD_C);
                      return;
                    }

                    /** Google and AWS have different language lists */
                    /** If the new language doesn't map then default to "en-US" */
                    let newLang = synthesis[vendor].find(
                      (lang) => lang.code === langSynth
                    );

                    if (newLang) {
                      setVoice(newLang.voices[0].value);
                      return;
                    }

                    newLang = synthesis[vendor].find(
                      (lang) => lang.code === LANG_EN_US
                    );

                    setLangSynth(LANG_EN_US);
                    setVoice(newLang!.voices[0].value);
                  }}
                />
              </fieldset>
              {vendorSynth && langSynth && (
                <>
                  <fieldset>
                    <label htmlFor="synthesis_lang">Language</label>
                    <Selector
                      id="synthesis_lang"
                      name="synthesis_lang"
                      value={langSynth}
                      options={synthesis[vendorSynth].map((lang) => ({
                        name: lang.name,
                        value: lang.code,
                      }))}
                      onChange={(e) => {
                        const language = e.target.value;
                        setLangSynth(language);

                        /** When using Google and en-US, ensure "Standard-C" is used as default */
                        if (
                          vendorSynth === VENDOR_GOOGLE &&
                          language === LANG_EN_US
                        ) {
                          setVoice(LANG_EN_US_STANDARD_C);
                          return;
                        }

                        const newLang = synthesis[vendorSynth].find(
                          (lang) => lang.code === language
                        );

                        setVoice(newLang!.voices[0].value);
                      }}
                    />
                  </fieldset>
                  <fieldset>
                    <label htmlFor="synthesis_voice">Voice</label>
                    <Selector
                      id="synthesis_voice"
                      name="synthesis_voice"
                      value={voice}
                      options={
                        synthesis[vendorSynth]
                          .filter((lang) => lang.code === langSynth)
                          .map((lang) =>
                            lang.voices.map((voice) => ({
                              name: voice.name,
                              value: voice.value,
                            }))
                          )
                          .flat() as Voice[]
                      }
                      onChange={(e) => setVoice(e.target.value)}
                    />
                  </fieldset>
                </>
              )}
            </>
          )}
          <fieldset>
            <P>
              Selected recognizer vendor:{" "}
              <strong>{vendorRecog || "undefined"}</strong>.
            </P>
            <P>
              Selected recognizer language:{" "}
              <strong>{langRecog || "undefined"}</strong>.
            </P>
          </fieldset>
          {recognizers && (
            <>
              <fieldset>
                <label htmlFor="recognizer_vendor">
                  Speech Recognizer Vendor
                </label>
                <Selector
                  id="recognizer_vendor"
                  name="recognizer_vendor"
                  value={vendorRecog}
                  options={vendors.slice(0, vendors.length - 1)}
                  onChange={(e) => {
                    const vendor = e.target.value as keyof RecognizerVendors;
                    setVendorRecog(vendor);

                    /** Google and AWS have different language lists */
                    /** If the new language doesn't map then default to "en-US" */
                    const newLang = recognizers[vendor].find(
                      (lang) => lang.code === langRecog
                    );

                    if (
                      (vendor === VENDOR_GOOGLE || vendor === VENDOR_AWS) &&
                      !newLang
                    ) {
                      setLangRecog(LANG_EN_US);
                    }
                  }}
                />
              </fieldset>
              {vendorRecog && langRecog && (
                <fieldset>
                  <label htmlFor="recognizer_lang">Language</label>
                  <Selector
                    id="recognizer_lang"
                    name="recognizer_lang"
                    value={langRecog}
                    options={recognizers[vendorRecog].map((lang) => ({
                      name: lang.name,
                      value: lang.code,
                    }))}
                    onChange={(e) => {
                      setLangRecog(e.target.value);
                    }}
                  />
                </fieldset>
              )}
            </>
          )}
        </form>
      </Section>
    </>
  );
};

export default Applications;
