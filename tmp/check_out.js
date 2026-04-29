// src/data/reviewStandards.js
var REVIEW_DIMENSIONS = [
  {
    id: "preparation",
    name: "\u6559\u5B66\u51C6\u5907",
    weight: 15,
    standards: [
      { id: "p1", name: "\u6559\u5B66\u76EE\u6807\u660E\u786E", description: "\u6559\u5B66\u76EE\u6807\u7B26\u5408\u8BFE\u6807\u8981\u6C42\uFF0C\u51C6\u786E\u3001\u5177\u4F53\u3001\u53EF\u68C0\u6D4B", maxScore: 5 },
      { id: "p2", name: "\u91CD\u70B9\u96BE\u70B9\u628A\u63E1", description: "\u51C6\u786E\u628A\u63E1\u6559\u6750\u91CD\u70B9\u96BE\u70B9\uFF0C\u5904\u7406\u5F97\u5F53", maxScore: 5 },
      { id: "p3", name: "\u6559\u5B66\u51C6\u5907\u5145\u5206", description: "\u6559\u5177\u3001\u8BFE\u4EF6\u3001\u677F\u4E66\u8BBE\u8BA1\u7B49\u51C6\u5907\u5145\u5206\uFF0C\u7B26\u5408\u6559\u5B66\u9700\u8981", maxScore: 5 }
    ]
  },
  {
    id: "content",
    name: "\u6559\u5B66\u5185\u5BB9",
    weight: 25,
    standards: [
      { id: "c1", name: "\u5185\u5BB9\u51C6\u786E\u65E0\u8BEF", description: "\u6559\u5B66\u5185\u5BB9\u79D1\u5B66\u51C6\u786E\uFF0C\u65E0\u77E5\u8BC6\u6027\u9519\u8BEF", maxScore: 5 },
      { id: "c2", name: "\u77E5\u8BC6\u7ED3\u6784\u6E05\u6670", description: "\u77E5\u8BC6\u8BB2\u89E3\u6761\u7406\u6E05\u6670\uFF0C\u903B\u8F91\u6027\u5F3A\uFF0C\u5C42\u6B21\u5206\u660E", maxScore: 5 },
      { id: "c3", name: "\u6559\u6750\u5904\u7406\u5F97\u5F53", description: "\u5BF9\u6559\u6750\u5185\u5BB9\u7684\u5904\u7406\u548C\u91CD\u7EC4\u5408\u7406\u6709\u6548", maxScore: 5 },
      { id: "c4", name: "\u4F8B\u9898\u9009\u62E9\u6070\u5F53", description: "\u4F8B\u9898\u5178\u578B\u3001\u68AF\u5EA6\u5408\u7406\uFF0C\u6709\u52A9\u4E8E\u5B66\u751F\u7406\u89E3", maxScore: 5 },
      { id: "c5", name: "\u7EC3\u4E60\u8BBE\u8BA1\u6709\u6548", description: "\u8BFE\u5802\u7EC3\u4E60\u8BBE\u8BA1\u6709\u9488\u5BF9\u6027\u3001\u5C42\u6B21\u6027\u548C\u62D3\u5C55\u6027", maxScore: 5 }
    ]
  },
  {
    id: "method",
    name: "\u6559\u5B66\u65B9\u6CD5",
    weight: 25,
    standards: [
      { id: "m1", name: "\u6559\u5B66\u65B9\u6CD5\u7075\u6D3B", description: "\u6839\u636E\u6559\u5B66\u5185\u5BB9\u548C\u5B66\u751F\u5B9E\u9645\u7075\u6D3B\u9009\u62E9\u6559\u5B66\u65B9\u6CD5", maxScore: 5 },
      { id: "m2", name: "\u542F\u53D1\u5F0F\u6559\u5B66", description: "\u5584\u4E8E\u542F\u53D1\u5F15\u5BFC\uFF0C\u6CE8\u91CD\u57F9\u517B\u5B66\u751F\u7684\u601D\u7EF4\u80FD\u529B\u548C\u63A2\u7A76\u610F\u8BC6", maxScore: 5 },
      { id: "m3", name: "\u4E92\u52A8\u6709\u6548", description: "\u5E08\u751F\u4E92\u52A8\u3001\u751F\u751F\u4E92\u52A8\u5145\u5206\u6709\u6548\uFF0C\u8BFE\u5802\u6C1B\u56F4\u6D3B\u8DC3", maxScore: 5 },
      { id: "m4", name: "\u65F6\u95F4\u5206\u914D\u5408\u7406", description: "\u5404\u6559\u5B66\u73AF\u8282\u65F6\u95F4\u5206\u914D\u5408\u7406\uFF0C\u8282\u594F\u628A\u63A7\u5F97\u5F53", maxScore: 5 },
      { id: "m5", name: "\u4FE1\u606F\u6280\u672F\u8FD0\u7528", description: "\u5408\u7406\u8FD0\u7528\u4FE1\u606F\u6280\u672F\u624B\u6BB5\u8F85\u52A9\u6559\u5B66\uFF0C\u6548\u679C\u826F\u597D", maxScore: 5 }
    ]
  },
  {
    id: "effect",
    name: "\u6559\u5B66\u6548\u679C",
    weight: 20,
    standards: [
      { id: "e1", name: "\u5B66\u751F\u53C2\u4E0E\u5EA6\u9AD8", description: "\u5B66\u751F\u79EF\u6781\u4E3B\u52A8\u53C2\u4E0E\u8BFE\u5802\u5B66\u4E60\u6D3B\u52A8", maxScore: 5 },
      { id: "e2", name: "\u76EE\u6807\u8FBE\u6210\u5EA6\u9AD8", description: "\u6559\u5B66\u76EE\u6807\u8FBE\u6210\u5EA6\u9AD8\uFF0C\u5B66\u751F\u638C\u63E1\u6548\u679C\u597D", maxScore: 5 },
      { id: "e3", name: "\u53CD\u9988\u53CA\u65F6\u6709\u6548", description: "\u80FD\u53CA\u65F6\u83B7\u53D6\u5B66\u751F\u53CD\u9988\u5E76\u505A\u51FA\u9488\u5BF9\u6027\u8C03\u6574", maxScore: 5 },
      { id: "e4", name: "\u5206\u5C42\u6559\u5B66\u843D\u5B9E", description: "\u5173\u6CE8\u4E0D\u540C\u5C42\u6B21\u5B66\u751F\u7684\u5B66\u4E60\u9700\u6C42\uFF0C\u56E0\u6750\u65BD\u6559", maxScore: 5 }
    ]
  },
  {
    id: "literacy",
    name: "\u6559\u5E08\u7D20\u517B",
    weight: 15,
    standards: [
      { id: "l1", name: "\u8BED\u8A00\u8868\u8FBE\u89C4\u8303", description: "\u6559\u5B66\u8BED\u8A00\u51C6\u786E\u3001\u7B80\u6D01\u3001\u751F\u52A8\uFF0C\u5BCC\u6709\u611F\u67D3\u529B", maxScore: 5 },
      { id: "l2", name: "\u677F\u4E66\u8BBE\u8BA1\u5408\u7406", description: "\u677F\u4E66\u8BBE\u8BA1\u89C4\u8303\u3001\u7F8E\u89C2\uFF0C\u7A81\u51FA\u6559\u5B66\u91CD\u70B9", maxScore: 5 }
    ]
  }
];
var GOOD_CLASS_DIMENSIONS = [
  {
    id: "seven_steps",
    name: "\u4E03\u6B65\u6559\u5B66\u6CD5",
    weight: 30,
    standards: [
      { id: "s1", name: "\u7EC3\u4E60\u6D4B\u9519\u9898\u8BB2\u89E3", description: "\u9AD8\u9891\u9519\u9898\uFF0C\u6E05\u6670\u8BB2\u89E3\uFF0C\u80FD\u5F52\u7EB3\u62D3\u5C55", maxScore: 3 },
      { id: "s2", name: "\u8FDB\u95E8\u8003/\u51FA\u95E8\u8003", description: "\u7EC4\u7EC7\u9AD8\u6548\uFF0C\u7EAA\u5F8B\u826F\u597D", maxScore: 2 },
      { id: "s3", name: "\u8BFE\u5802\u5F15\u5165", description: "\u5F15\u5165\u6070\u5F53\uFF0C\u80FD\u591F\u5438\u5F15\u5B66\u751F\uFF0C\u4E0E\u6388\u8BFE\u8054\u7CFB\u7D27\u5BC6", maxScore: 5 },
      { id: "s4", name: "\u65B0\u8BFE\u7A81\u7834", description: "\u6559\u5B66\u76EE\u6807\u6E05\u6670\uFF0C\u6709\u6548\u7A81\u7834\u91CD\u96BE\u70B9\u3001\u6613\u9519\u70B9", maxScore: 7 },
      { id: "s5", name: "\u7EC3\u4E60\u5DE9\u56FA", description: "\u5DE9\u56FA\u7EC3\u4E60\u8BBE\u8BA1\u3001\u8BB2\u89E3\u5408\u7406\uFF0C\u5E2E\u52A9\u5B66\u751F\u5145\u5206\u5438\u6536", maxScore: 5 },
      { id: "s6", name: "\u603B\u7ED3", description: "\u5F15\u5BFC\u5B66\u751F\u603B\u7ED3\u65B9\u6CD5\uFF0C\u4E3E\u4E00\u53CD\u4E09", maxScore: 4 },
      { id: "s7", name: "\u4F5C\u4E1A", description: "\u4F5C\u4E1A\u5E03\u7F6E\u6E05\u6670\u3001\u5408\u7406\u6709\u9488\u5BF9\u6027", maxScore: 4 }
    ]
  },
  {
    id: "interest",
    name: "\u6FC0\u53D1\u5174\u8DA3",
    weight: 20,
    standards: [
      { id: "i1", name: "\u5E7D\u9ED8", description: "\u6CE8\u91CD\u8425\u9020\u8BFE\u5802\u5E7D\u9ED8\u6C1B\u56F4\uFF0C\u67092-3\u6B21\u7B11\u58F0\uFF0C\u6574\u4F53\u8BFE\u5802\u6C1B\u56F4\u8F7B\u677E\uFF0C\u8001\u5E08\u9762\u5E26\u7B11\u5BB9", maxScore: 5 },
      { id: "i2", name: "\u6FC0\u60C5", description: "\u6FC0\u60C5\uFF0C\u4F20\u9012\u6B63\u80FD\u91CF\uFF0C\u4F20\u9012\u597D\u7684\u7CBE\u6C14\u795E\uFF0C\u58F0\u97F3\u6D2A\u4EAE\u3001\u6D41\u7545\u3001\u666E\u901A\u8BDD\u3001\u6291\u626C\u987F\u632B", maxScore: 5 },
      { id: "i3", name: "\u4E92\u52A8", description: "\u5173\u6CE8\u6BCF\u4E00\u4E2A\u5B66\u751F\uFF0C\u72B6\u6001\u3001\u5FC3\u6001\u3001\u6709\u6E29\u5EA6\uFF0C\u63D0\u95EE\u8BED\u8A00\u7B80\u660E\u6709\u6548/\u9891\u7387\u3001\u5BF9\u5B66\u751F\u89C2\u70B9\u7684\u56DE\u5E94\u8D28\u91CF", maxScore: 5 },
      { id: "i4", name: "\u6FC0\u52B1", description: "\u79EF\u6781\u9F13\u52B1\uFF0C\u6293\u4F4F\u5B66\u751F\u95EA\u5149\u8FDB\u884C\u5408\u9002\u7684\u8868\u626C\uFF0C\u6FC0\u53D1\u5174\u8DA3", maxScore: 5 }
    ]
  },
  {
    id: "inspire",
    name: "\u542F\u53D1\u5F0F\u6559\u5B66",
    weight: 12,
    standards: [
      { id: "h1", name: "\u95EE\u9898\u8BBE\u8BA1", description: "\u63D0\u95EE\u5177\u6709\u5C42\u6B21\u6027\uFF08\u4ECE\u5177\u4F53\u5230\u62BD\u8C61\uFF09\uFF0C\u80FD\u6FC0\u53D1\u5B66\u751F\u6DF1\u5EA6\u63A2\u7A76\uFF0C\u51E0\u4E4E\u65E0\u4F4E\u6548\u63D0\u95EE\uFF08\u662F\u4E0D\u662F\u3001\u5BF9\u4E0D\u5BF9\uFF09", maxScore: 6 },
      { id: "h2", name: "\u601D\u7EF4\u57F9\u517B", description: "\u7ED9\u8DB3\u5B66\u751F\u601D\u8003\u7A7A\u95F4\uFF0C\u6CE8\u91CD\u8FFD\u95EE\u5B66\u751F\u56DE\u7B54\u601D\u8003\u8FC7\u7A0B", maxScore: 6 }
    ]
  },
  {
    id: "habit",
    name: "\u57F9\u517B\u4E60\u60EF",
    weight: 10,
    standards: [
      { id: "b1", name: "\u4E60\u60EF\u5F15\u5BFC", description: "\u5F15\u5BFC\u6BCF\u4E00\u4E2A\u5B66\u751F\u5750\u59FF\u3001\u773C\u795E\u3001\u7B14\u8BB0\u3001\u4E66\u5199\u3001\u8349\u7A3F\uFF08\u8BED\u8A00\uFF09", maxScore: 5 },
      { id: "b2", name: "\u4E60\u60EF\u843D\u5B9E", description: "\u5B9A\u671F\u68C0\u67E5\u7B14\u8BB0/\u8349\u7A3F\uFF0C\u89C2\u5BDF\u8BFE\u540E\u4E60\u60EF\u843D\u5B9E\u60C5\u51B5\uFF08\u684C\u9762\uFF09", maxScore: 5 }
    ]
  },
  {
    id: "implement",
    name: "\u6CE8\u91CD\u843D\u5B9E",
    weight: 10,
    standards: [
      { id: "im1", name: "\u53CA\u65F6\u53CD\u9988", description: "\u5BF9\u5B66\u751F\u9519\u8BEF\u5373\u65F6\u7EA0\u6B63\uFF0C\u901A\u8FC7\u91CD\u70B9\u590D\u8FF0\u68C0\u9A8C\u5B66\u751F\u5BF9\u77E5\u8BC6\u7684\u7406\u89E3\u7A0B\u5EA6", maxScore: 5 },
      { id: "im2", name: "\u9AD8\u6548\u843D\u5B9E", description: "\u6309\u65F6\u5B8C\u6210\u8BFE\u5802\u76EE\u6807\uFF0C\u8BFE\u540E\u2014\u2014\u8FC7\u5173\uFF0C\u5B66\u751F\u638C\u63E1\u8FD0\u7528\u597D", maxScore: 5 }
    ]
  },
  {
    id: "temperament",
    name: "\u6559\u5E08\u6C14\u8D28",
    weight: 8,
    standards: [
      { id: "t1", name: "\u4EEA\u6001\u4EEA\u8868", description: "\u7740\u88C5\u6574\u6D01\u5927\u65B9\uFF0C\u6559\u59FF\u6559\u6001\u597D", maxScore: 4 },
      { id: "t2", name: "\u7EFC\u5408\u7D20\u517B", description: "\u8BFE\u5802\u7BA1\u63A7\uFF0C\u5E94\u5BF9\u80FD\u529B", maxScore: 4 }
    ]
  },
  {
    id: "guarantee",
    name: "\u6559\u5B66\u4FDD\u969C",
    weight: 5,
    standards: [
      { id: "g1", name: "\u677F\u4E66\u8BBE\u8BA1", description: "\u677F\u4E66\u8BBE\u8BA1\u5408\u7406\u7CBE\u7F8E\uFF0C\u96F6\u9519\u8BEF\uFF0C\u5206\u533A\u677F\u4E66\u903B\u8F91\u6E05\u6670\uFF0C\u5B57\u8FF9\u5DE5\u6574\uFF0C\u7EA2\u9ED1\u7B14\u4F7F\u7528\u51C6\u786E\uFF0C\u91CD\u70B9\u7A81\u51FA", maxScore: 5 }
    ]
  },
  {
    id: "overall",
    name: "\u6574\u4F53\u611F\u53D7",
    weight: 5,
    standards: [
      { id: "o1", name: "\u6574\u4F53\u611F\u53D7", description: "\u5982\u4F60\u7684\u5B69\u5B50\u5728\u672C\u73ED\u5B66\u4E60\uFF0C\u6839\u636E\u5B69\u5B50\u7684\u5B66\u4E60\u6536\u83B7\u4F60\u4F1A\u505A\u5176\u4ED6\u9009\u62E9\u5417\uFF1F\u53EF\u4EE5\u63A5\u53D73\u5206\uFF0C\u975E\u5E38\u613F\u610F\u7EE7\u7EED\u5B66\u4E605\u5206", maxScore: 5 }
    ]
  }
];
function getAllStandards(type) {
  const dimensions = type === "class_recording" ? GOOD_CLASS_DIMENSIONS : REVIEW_DIMENSIONS;
  return dimensions.flatMap(
    (dim) => dim.standards.map((s) => ({ ...s, dimension: dim.name, dimensionId: dim.id }))
  );
}
var TOTAL_MAX_SCORE = getAllStandards("lesson_plan").reduce((sum, s) => sum + s.maxScore, 0);
var GOOD_CLASS_TOTAL_SCORE = getAllStandards("class_recording").reduce((sum, s) => sum + s.maxScore, 0);
var REVIEW_TYPES = {
  lesson_plan: "\u8BC4\u6559\u6848",
  lesson_polish: "\u8BC4\u78E8\u8BFE",
  class_recording: "\u8BC4\u5B9E\u5F55"
};
var REVIEW_TYPE_OPTIONS = [
  { value: "lesson_plan", label: "\u8BC4\u6559\u6848", iconKey: "FileText", desc: "\u8BC4\u5BA1\u6559\u5E08\u6559\u6848\u8BBE\u8BA1\uFF08\u8302\u6797\u78E8\u8BFE\u6807\u51C6\uFF09" },
  { value: "lesson_polish", label: "\u8BC4\u78E8\u8BFE", iconKey: "Hammer", desc: "\u8BC4\u5BA1\u78E8\u8BFE\u8FC7\u7A0B\uFF08\u8302\u6797\u78E8\u8BFE\u6807\u51C6\uFF09" },
  { value: "class_recording", label: "\u8BC4\u5B9E\u5F55", iconKey: "Video", desc: "\u8BC4\u5BA1\u8BFE\u5802\u5B9E\u5F55\u8BB0\u5F55\uFF08\u8302\u6797\u597D\u8BFE\u6807\u51C6\uFF09" }
];
var PASS_SCORE = 85;
function buildReviewPrompt(type, teacherName, grade, subject, content) {
  const allStandards = getAllStandards(type);
  const standardList = allStandards.map(
    (s, i) => `${i + 1}. ${s.name}\uFF08${s.dimension}\uFF09\uFF1A${s.description}\uFF08\u6EE1\u5206${s.maxScore}\u5206\uFF09`
  ).join("\n");
  const typeName = REVIEW_TYPES[type] || type;
  const standardName = type === "class_recording" ? "\u8302\u6797\u597D\u8BFE\u6807\u51C6" : "\u8302\u6797\u78E8\u8BFE\u6807\u51C6";
  return `\u4F60\u662F\u4E00\u4F4D\u7ECF\u9A8C\u4E30\u5BCC\u7684\u5C0F\u5B66\u6570\u5B66\u6559\u5B66\u8BC4\u5BA1\u4E13\u5BB6\u3002\u8BF7\u6839\u636E${standardName}\uFF0C\u5BF9\u4EE5\u4E0B${typeName}\u5185\u5BB9\u8FDB\u884C\u4E13\u4E1A\u8BC4\u5BA1\u3002

\u8BC4\u5BA1\u6559\u5E08\uFF1A${teacherName}
\u5E74\u7EA7\uFF1A${grade}
\u5B66\u79D1\uFF1A\u6570\u5B66
${typeName}\u5185\u5BB9\uFF1A
${content}

\u8BF7\u4E25\u683C\u6309\u7167\u4EE5\u4E0B${allStandards.length}\u6761\u6807\u51C6\u9010\u9879\u8BC4\u5206\uFF0C\u5E76\u7ED9\u51FA\u7EFC\u5408\u8BC4\u4EF7\u3002

${standardList}

\u8BF7\u6309\u4EE5\u4E0BJSON\u683C\u5F0F\u8FD4\u56DE\u8BC4\u8BFE\u7ED3\u679C\uFF08\u4E0D\u8981\u5305\u542B\u5176\u4ED6\u5185\u5BB9\uFF09\uFF1A
{
  "totalScore": <\u603B\u52060-100>,
  "dimensions": [
    {
      "dimensionId": "<\u7EF4\u5EA6ID>",
      "name": "<\u7EF4\u5EA6\u540D\u79F0>",
      "score": <\u7EF4\u5EA6\u5F97\u5206>,
      "maxScore": <\u7EF4\u5EA6\u6EE1\u5206>,
      "standards": [
        {
          "id": "<\u6807\u51C6ID>",
          "name": "<\u6807\u51C6\u540D\u79F0>",
          "score": <\u5F97\u5206>,
          "maxScore": <maxScore>,
          "comment": "<\u7B80\u8981\u8BC4\u8BED>"
        }
      ],
      "comment": "<\u7EF4\u5EA6\u7EFC\u5408\u8BC4\u8BED>"
    }
  ],
  "overallComment": "<\u603B\u4F53\u8BC4\u8BED>",
  "suggestions": ["<\u6539\u8FDB\u5EFA\u8BAE1>", "<\u6539\u8FDB\u5EFA\u8BAE2>", "<\u6539\u8FDB\u5EFA\u8BAE3>"],
  "highlights": ["<\u4EAE\u70B91>", "<\u4EAE\u70B92>"]
}`;
}
export {
  GOOD_CLASS_DIMENSIONS,
  GOOD_CLASS_TOTAL_SCORE,
  PASS_SCORE,
  REVIEW_DIMENSIONS,
  REVIEW_TYPES,
  REVIEW_TYPE_OPTIONS,
  TOTAL_MAX_SCORE,
  buildReviewPrompt,
  getAllStandards
};
