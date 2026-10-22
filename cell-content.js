/* Three explicitly named teaching specimens; presence is not inferred from colour or outline. */
(function(root){
  'use strict';
  const title='没有叶绿体，就不是植物细胞吗？';
  const parts={
    wall:{name:'细胞壁',role:'位于细胞膜外，主要起支持和保护作用；不能替代细胞膜控制物质进出的功能。'},
    membrane:{name:'细胞膜',role:'包围细胞内部，控制物质进出。植物细胞有细胞壁，也仍然需要细胞膜。'},
    cytoplasm:{name:'细胞质',role:'细胞膜以内、细胞核以外的部分，含多种细胞结构，是许多生命活动进行的场所。'},
    nucleus:{name:'细胞核',role:'储存主要的遗传信息，参与调控细胞的生命活动。“主要”不等于所有遗传物质只在细胞核里。'},
    vacuole:{name:'大液泡',role:'内有细胞液，含水和多种溶解的物质；不是空洞，也不是遗传信息的主要储存处。'},
    chloroplast:{name:'叶绿体',role:'进行光合作用。许多绿色叶肉细胞有叶绿体，但不是每个植物细胞都有。'}
  };
  const samples={
    onion:{name:'洋葱鳞片叶内表皮细胞',short:'洋葱内表皮',type:'植物',parts:['wall','membrane','cytoplasm','nucleus','vacuole'],note:'这是植物细胞，但没有叶绿体。不要把整个洋葱植株的细胞都当作这一种。'},
    leaf:{name:'绿色叶肉细胞',short:'绿色叶肉',type:'植物',parts:['wall','membrane','cytoplasm','nucleus','vacuole','chloroplast'],note:'这个叶肉细胞有叶绿体，能进行光合作用。叶片中还存在其他类型的细胞。'},
    cheek:{name:'人的口腔上皮细胞',short:'口腔上皮',type:'动物',parts:['membrane','cytoplasm','nucleus'],note:'有细胞膜、细胞质和细胞核，没有细胞壁、叶绿体或植物式的大液泡。'}
  };
  const questions=[
    {kind:'choice',skill:'先判断，留下最初的想法',title:'没有叶绿体，就能认定它是动物细胞吗？',context:'这是一份典型动植物细胞的比较任务。样本甲已确认有细胞壁、细胞膜、细胞质、细胞核和大液泡，没有叶绿体。这里只比较动物与植物，不讨论真菌和细菌。',options:['能，没有叶绿体就是动物细胞','不能；还要结合细胞壁等结构判断','能，只要颜色不是绿色就是动物细胞'],answer:1,hint:'某一种植物细胞有的结构，是否每个植物细胞都必须有？甲还提供了什么结构证据？',explanation:'不能只凭没有叶绿体认定为动物细胞。甲对应洋葱鳞片叶内表皮细胞，有细胞壁和大液泡，却没有叶绿体。在本题限定的动植物比较中，这些结构支持把甲判断为植物细胞。'},
    {kind:'pick',skill:'从功能找到结构',title:'哪一层主要控制物质进出细胞？',context:'图中A是细胞壁，B是细胞膜，C是大液泡，D是细胞核。点选图中标记或同名按钮，再确认。不要把支持保护和控制物质进出混为一谈。',options:['A：细胞壁','B：细胞膜','C：大液泡','D：细胞核'],targets:['wall','membrane','vacuole','nucleus'],answer:1,hint:'植物细胞外侧有壁，壁的内侧还有一层薄膜。哪一层负责控制物质进出？',explanation:'B：细胞膜。细胞壁主要支持、保护；细胞膜控制物质进出。外面有细胞壁，不代表里面的膜就多余。图中为方便区分，把膜与壁画开了一点，实际通常紧贴。'},
    {kind:'open',skill:'比较共同点，再说作用',title:'叶肉细胞和口腔上皮细胞，共有哪些基本结构？',context:'写出这两种细胞共有的3种基本结构，再选其中一种说明作用。不要求列出所有细胞结构。',hint:'不要只找“植物独有”的部分。两个图里，外部边界、内部区域、储存主要遗传信息的结构分别是什么？',reference:'两者都有细胞膜、细胞质和细胞核。比如，细胞膜控制物质进出；细胞质是许多生命活动进行的场所；细胞核储存主要遗传信息。选择其中一种说明作用即可。',checks:['列出两者共有的细胞膜、细胞质、细胞核。','至少把一种结构与正确作用对应起来，不能说动物细胞没有细胞膜。']},
    {kind:'choice',skill:'纠正一份功能记录',title:'“大液泡主要保存遗传信息”，这条记录应怎样改？',context:'比较对象仍是本课的典型动植物细胞。纠正主要遗传信息的储存位置；不把“主要”误写成“全部”。',options:['改成细胞壁主要保存遗传信息','改成叶绿体是所有细胞的遗传信息库','改成细胞核储存主要遗传信息'],answer:2,hint:'大液泡里是细胞液。哪种结构与遗传信息及细胞生命活动的调控密切相关？',explanation:'应改成细胞核储存主要遗传信息。大液泡中的细胞液含水和多种溶解物质。“所有遗传信息只能在核里”也过于绝对：线粒体、叶绿体中也有遗传物质。'},
    {kind:'open',skill:'换一组证据，独立说明',title:'两份样本都没有叶绿体，能把它们归成同一类吗？',context:'已确认两份样本分别来自一种典型植物细胞和一种典型动物细胞。甲有细胞壁、细胞膜、细胞质、细胞核和大液泡，没有叶绿体；乙有细胞膜、细胞质、细胞核，确认没有细胞壁，也没有叶绿体或植物式大液泡。哪个是植物细胞、哪个是动物细胞？用证据说明，不按外形猜。',hint:'先找两者相同的结构，再找能区分的结构。“没有叶绿体”在两份样本中相同，还能用它区分吗？',reference:'甲是植物细胞，乙是动物细胞。两者都有细胞膜、细胞质和细胞核；但甲有细胞壁和大液泡，乙没有细胞壁。两者都没有叶绿体，所以这一条不能区分它们。这个判断只适用于题目限定的典型动植物比较，不能推广成“有壁的一定都是植物”。',checks:['在题目限定下判断甲植物、乙动物，用细胞壁等差异支持结论。','说明两者都没有叶绿体，不能仅凭这一共同点分类；不靠颜色或形状猜。']}
  ];
  function hasPart(sample,part){if(!samples[sample]||!parts[part])throw new Error('Unknown specimen or structure');return samples[sample].parts.includes(part);}
  function describe(sample,part){const s=samples[sample],p=parts[part];if(!s||!p)throw new Error('Unknown specimen or structure');return hasPart(sample,part)?`${s.short}有${p.name}。${p.role}`:`${s.short}没有${p.name}。${part==='chloroplast'?'没有叶绿体，不能单独决定它是动物还是植物。':'请切换样本，比较这种结构出现在哪里。'}`;}
  root.CellLesson={title,parts,samples,questions,hasPart,describe};
  if(typeof module!=='undefined'&&module.exports)module.exports=root.CellLesson;
})(typeof window!=='undefined'?window:globalThis);
