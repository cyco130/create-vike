type GeneratorOutput = Promise<{
  mime: "application/json"|"application/javascript"|"application/typescript"
  content: string
}>
type Generator<T, U extends GeneratorOutput> = (props: T) => U

type LanguageChoice = "js"|"ts";

type FrameworkChoice = "react"|"vue";

type Transform<T> = (content: T) => T;

type TransformRecords<T> = Partial<Record<SpecificityKey, Transform<T>>>;

type SpecificityOptions = {
  /** Specificity: 1 */
  language: LanguageChoice;
  /** Specificity: 2 */
  framework: FrameworkChoice;
  // thought experiment, what if we try to add a new option here, how would we need to change the current code?
}
type SpecificityKey = `${FrameworkChoice}-${LanguageChoice}`|FrameworkChoice|LanguageChoice;
