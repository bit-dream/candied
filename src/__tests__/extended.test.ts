import Can from "../can/Can";

test('Validate isExtended function', () => {
    const can = new Can();
    expect(can.isIdExtended(2566712062)).toBe(true);
    expect(can.isIdExtended(2364549630)).toBe(true);
    expect(can.isIdExtended(2499614462)).toBe(true);
    expect(can.isIdExtended(2147487969)).toBe(true);
    expect(can.isIdExtended(100)).toBe(false);
    expect(can.isIdExtended(2000)).toBe(false);
});

test('Validate convertIdToStandard function', () => {
    const can = new Can();
    expect(can.unsetExtendedFlag(2147487969)).toBe(4321);
});

test('Validate convertIdToStandard function', () => {
    const can = new Can();
    expect(can.setExtendedFlag(4321)).toBe(2147487969);
});