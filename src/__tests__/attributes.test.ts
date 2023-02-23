import Dbc, { Attribute, Attributes, Message } from '../dbc/Dbc';
import dbcReader from '../filesystem/DbcReader';

test('DBC_template.dbc: Global attributes', (done) => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const attributes: Attributes = new Map();
  const attribute: Attribute = {
    name: 'FloatAttribute',
    type: 'Global',
    dataType: 'FLOAT',
    options: null,
    defaultValue: '25.25',
    value: '45.9',
    min: 0,
    max: 50.5,
  };
  attributes.set('FloatAttribute', attribute);
  expect(data.attributes).toEqual(attributes);
  done();
});

test('DBC_template.dbc: Message attributes', (done) => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const attributes: Attributes = new Map();
  const attribute: Attribute = {
    name: 'BOStringAttribute',
    type: 'Message',
    dataType: 'STRING',
    options: null,
    defaultValue: 'String',
    value: 'MessageAttribute',
    min: null,
    max: null,
  };
  attributes.set('BOStringAttribute', attribute);
  expect(data.messages.get('CANMessage')?.attributes).toEqual(attributes);
  done();
});

test('DBC_template.dbc: Message attributes 2', (done) => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const attributes: Attributes = new Map();
  const attribute: Attribute = {
    name: 'BOStringAttribute',
    type: 'Message',
    dataType: 'STRING',
    options: null,
    defaultValue: 'String',
    value: 'MessageAttribute2',
    min: null,
    max: null,
  };
  attributes.set('BOStringAttribute', attribute);
  expect(data.messages.get('CANMultiplexed')?.attributes).toEqual(attributes);
  done();
});

test('DBC_template.dbc: Signal attributes', (done) => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/DBC_template.dbc');
  const data = dbc.load(fileContent);
  const attributes: Attributes = new Map();
  const attribute: Attribute = {
    name: 'SGEnumAttribute',
    type: 'Signal',
    dataType: 'ENUM',
    options: ['Val0', 'Val1', 'Val2'],
    defaultValue: '1',
    value: '2',
    min: null,
    max: null,
  };
  attributes.set('SGEnumAttribute', attribute);
  expect(data.messages.get('CANMessage')?.signals.get('Signal0')?.attributes).toEqual(attributes);
  done();
});

test('attributes.dbc: Complex attribute parsing', (done) => {
  const dbc = new Dbc();
  const fileContent = dbcReader('src/__tests__/testFiles/attributes.dbc');
  const data = dbc.load(fileContent);
  expect(data.messages.size).toBe(16);

  // There should be a total of 14*2 total attributes for messages
  const totalMsgAttr = Array.from(data.messages.values()).reduce((prev: number, curr: Message): number => {
    return prev + curr.attributes.size;
  }, 0);
  expect(totalMsgAttr).toBe(14 * 2);

  done();
});

test('Min option attribute creation', (done) => {
  const dbc = new Dbc();
  const attr = dbc.createAttribute('TestAttribute', 'STRING');

  expect(attr).toEqual({
    name: 'TestAttribute',
    type: 'Global',
    dataType: 'STRING',
    value: null,
    defaultValue: null,
    options: null,
    min: null,
    max: null,
  });
  done();
});

test('Message option attribute creation as INT', (done) => {
  const dbc = new Dbc();
  const attr = dbc.createAttribute('TestAttribute', 'INT', {
    type: 'Message',
    min: 0,
    max: 10,
  });

  expect(attr).toEqual({
    name: 'TestAttribute',
    type: 'Message',
    dataType: 'INT',
    value: null,
    defaultValue: null,
    options: null,
    min: 0,
    max: 10,
  });
  done();
});

test('Signal option attribute creation as ENUM', (done) => {
  const dbc = new Dbc();
  const attr = dbc.createAttribute('TestAttribute', 'ENUM', {
    type: 'Signal',
    enumMembers: ['Enum1', 'Enum2'],
  });

  expect(attr).toEqual({
    name: 'TestAttribute',
    type: 'Signal',
    dataType: 'ENUM',
    value: null,
    defaultValue: null,
    options: ['Enum1', 'Enum2'],
    min: null,
    max: null,
  });
  done();
});

test('Signal option attribute creation as ENUM with default', (done) => {
  const dbc = new Dbc();
  const attr = dbc.createAttribute(
    'TestAttribute',
    'ENUM',
    {
      type: 'Signal',
      enumMembers: ['Enum1', 'Enum2'],
    },
    {
      defaultValue: '0',
    },
  );

  expect(attr).toEqual({
    name: 'TestAttribute',
    type: 'Signal',
    dataType: 'ENUM',
    value: null,
    defaultValue: '0',
    options: ['Enum1', 'Enum2'],
    min: null,
    max: null,
  });
  done();
});

test('Add Signal attribute', (done) => {
  const dbc = new Dbc();
  dbc.createMessage('TestMessage', 100, 8).add().addSignal('TestSignal', 0, 10);

  const attr = dbc.createAttribute(
    'TestAttribute',
    'ENUM',
    {
      type: 'Signal',
      enumMembers: ['Enum1', 'Enum2'],
    },
    {
      value: '1',
    },
  );

  dbc.addAttribute(attr, { signalName: 'TestSignal', id: 100 });

  expect(dbc.getSignalByName('TestSignal', 'TestMessage').attributes.size).toEqual(1);
  done();
});

test('Add Message attribute', (done) => {
  const dbc = new Dbc();
  dbc.createMessage('TestMessage', 100, 8).add().addSignal('TestSignal', 0, 10);

  const attr = dbc.createAttribute(
    'TestAttribute',
    'ENUM',
    {
      type: 'Message',
      enumMembers: ['Enum1', 'Enum2'],
    },
    {
      value: '1',
    },
  );

  dbc.addAttribute(attr, { id: 100 });

  expect(dbc.getMessageById(100).attributes.size).toEqual(1);
  done();
});

test('Signal option attribute creation as ENUM with value', (done) => {
  const dbc = new Dbc();
  const attr = dbc.createAttribute(
    'TestAttribute',
    'ENUM',
    {
      type: 'Signal',
      enumMembers: ['Enum1', 'Enum2'],
    },
    {
      value: '1',
    },
  );

  expect(attr).toEqual({
    name: 'TestAttribute',
    type: 'Signal',
    dataType: 'ENUM',
    value: '1',
    defaultValue: '1',
    options: ['Enum1', 'Enum2'],
    min: null,
    max: null,
  });
  done();
});

test('Exercise failure modes', async () => {
  const dbc = new Dbc();
  expect(() => {
    dbc.createAttribute('TestAttribute', 'INT');
  }).toThrow('Additional attribute properties are required for any type other than STRING');
  expect(() => {
    dbc.createAttribute('TestAttribute', 'INT', { type: 'Message' });
  }).toThrow('min and max are required properties when defining anything other than type ENUM and STRING');
  expect(() => {
    dbc.createAttribute('TestAttribute', 'ENUM', { type: 'Message', min: 0 });
  }).toThrow('enumMembers is a required property when defining an attribute with type ENUM');
});
