import { isProduction } from "./env";

const isProductionTestCases = [
  {
    hostname: "dev-training-dqs.social-surveys.gcp.onsdigital.uk",
    expected: false,
  },
  {
    hostname: "localhost",
    expected: false,
  },
  {
    hostname: "bam.preprod-blaise.gcp.onsdigital.uk",
    expected: false,
  },
  {
    hostname: "bam.blaise.gcp.onsdigital.uk",
    expected: true,
  },
];

describe("isProduction", () => {
  it.each(isProductionTestCases)(
    "checks whether a hostname is production",
    ({ hostname, expected }) => {
      expect(isProduction(hostname)).toBe(expected);
    },
  );
});
