import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkIaDomain() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🤖 LANGAGES ET TOOLS DU DOMAINE "IA"\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const iaItems = await langageModel
      .find({ domain: 'ia' })
      .sort({ name: 1 })
      .exec();

    // Catégoriser
    const languages: any[] = [];
    const frameworks: any[] = [];
    const tools: any[] = [];
    const others: any[] = [];

    iaItems.forEach((item: any) => {
      const domains = item.domain || [];
      if (domains.includes('language')) {
        languages.push(item);
      } else if (domains.includes('framework')) {
        frameworks.push(item);
      } else if (domains.includes('tools')) {
        tools.push(item);
      } else {
        others.push(item);
      }
    });

    console.log(`🤖 Total: ${iaItems.length} éléments\n`);

    console.log('🔤 LANGAGES:');
    if (languages.length > 0) {
      languages.forEach((l: any) => {
        const version = l.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${l.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🏗️ FRAMEWORKS:');
    if (frameworks.length > 0) {
      frameworks.forEach((f: any) => {
        const version = f.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${f.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n🔧 TOOLS:');
    if (tools.length > 0) {
      tools.forEach((t: any) => {
        const version = t.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${t.name} (${version})`);
      });
    } else {
      console.log('  (aucun)');
    }

    console.log('\n📦 AUTRES:');
    if (others.length > 0) {
      others.forEach((o: any) => {
        const version = o.versions?.find((v: any) => v.type === 'current')?.label || 'N/A';
        console.log(`  • ${o.name} (${version}) - domains: ${o.domain.join(', ')}`);
      });
    } else {
      console.log('  (aucun)');
    }

    // Suggestions
    console.log('\n\n💡 TECHNOLOGIES IA POPULAIRES À VÉRIFIER:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const existingNames = iaItems.map((i: any) => i.name.toLowerCase());

    const suggestedIA = {
      'Langages': ['Python', 'R', 'Julia'],
      'ML/DL Frameworks': ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'JAX', 'Hugging Face Transformers'],
      'LLM Frameworks': ['LangChain', 'LlamaIndex', 'Haystack', 'Semantic Kernel'],
      'Model Serving': ['TensorFlow Serving', 'TorchServe', 'ONNX Runtime', 'Triton'],
      'AutoML': ['AutoKeras', 'Auto-sklearn', 'H2O.ai', 'Ludwig'],
      'Computer Vision': ['OpenCV', 'PIL/Pillow', 'Albumentations', 'YOLO'],
      'NLP': ['spaCy', 'NLTK', 'Gensim', 'Transformers'],
      'Reinforcement Learning': ['Stable Baselines3', 'Ray RLlib', 'OpenAI Gym'],
      'Vector Databases': ['Pinecone', 'Weaviate', 'Milvus', 'Qdrant', 'Chroma'],
      'Model Formats': ['ONNX', 'TensorRT', 'CoreML', 'TFLite'],
      'Cloud AI': ['OpenAI API', 'Anthropic Claude', 'Google Gemini', 'AWS Bedrock']
    };

    for (const [category, items] of Object.entries(suggestedIA)) {
      const missing = items.filter(item => !existingNames.includes(item.toLowerCase()));
      const present = items.filter(item => existingNames.includes(item.toLowerCase()));

      console.log(`${category}:`);
      if (present.length > 0) {
        console.log(`  ✅ Présents: ${present.join(', ')}`);
      }
      if (missing.length > 0) {
        console.log(`  ❌ Manquants: ${missing.join(', ')}`);
      }
      console.log('');
    }

  } finally {
    await app.close();
  }
}

checkIaDomain().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
