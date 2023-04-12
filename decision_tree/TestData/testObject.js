export function getTestObject(number) {
  let testObject = [];
  testObject[0] = ["overcast",    "hot",          "high",         "FALSE",    "yes"   ];
  testObject[1] = ["Ниже",        "В гостях",     "Пропускают",   "Нет",      "Нет"       ];
  testObject[2] = ["П. облачность",   "Прохладно",    "Нормальная",   "Да",       "Играть"    ];
  testObject[3] = ["TB",      "GIAM",     "THAP",     "CAO",      "THAP " ];
  return testObject[number];
}

