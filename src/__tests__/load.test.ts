import dbcReader from "../filesystem/DbcReader";

// All return values validated using Kvaser CANKing
test('Load: Invalid File', async () => {
  expect(()=>dbcReader('src/__tests__/testFiles/dummy_file.txt')).toThrow(
      `Function expected a file extension of '.dbc', got .txt`
  );
});