import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixIaSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🤖 AJOUT DES SUPPORT DURATION POUR LES OUTILS IA\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Valeurs à appliquer (en mois)
    const supportDurations: Record<string, Record<string, number>> = {
      // LLM Frameworks - écosystème récent, évolution rapide
      'LangChain': { 'current': 6 },
      'LlamaIndex': { 'current': 6 },
      'Haystack': { 'current': 12 },
      'Semantic Kernel': { 'current': 6 },

      // Computer Vision - outils matures
      'OpenCV': { 'current': 24 },
      'YOLO': { 'current': 12 },
      'Albumentations': { 'current': 12 },

      // NLP - outils établis
      'spaCy': { 'current': 18 },
      'Transformers': { 'current': 12 },
      'NLTK': { 'current': 24 },
      'Gensim': { 'current': 18 },

      // Vector Databases - nouveaux mais en croissance
      'Pinecone': { 'current': 6 },
      'Weaviate': { 'current': 12 },
      'Chroma': { 'current': 6 },
      'Milvus': { 'current': 12 },
      'Qdrant': { 'current': 12 },

      // Model Formats - standards établis
      'ONNX': { 'current': 18 },
      'TensorRT': { 'current': 18 },
      'CoreML': { 'current': 12 },
      'TFLite': { 'current': 18 },

      // Model Serving - outils de production
      'ONNX Runtime': { 'current': 18 },
      'TensorFlow Serving': { 'current': 18 },
      'TorchServe': { 'current': 12 },
      'Triton': { 'current': 18 },

      // AutoML - outils spécialisés
      'Auto-sklearn': { 'current': 12 },
      'H2O.ai': { 'current': 18 },

      // Reinforcement Learning
      'Stable Baselines3': { 'current': 12 },
      'OpenAI Gym': { 'current': 18 }
    };

    let updated = 0;
    let created = 0;

    for (const [toolName, versionDurations] of Object.entries(supportDurations)) {
      const tool = await langageModel.findOne({ name: toolName }).exec();

      if (!tool) {
        console.log(`❌ ${toolName}: Non trouvé`);
        continue;
      }

      let modified = false;

      // Si pas de versions, créer la version current
      if (!tool.versions || tool.versions.length === 0) {
        tool.versions = [];
        for (const [type, duration] of Object.entries(versionDurations)) {
          tool.versions.push({
            type,
            label: 'N/A',
            supportDuration: duration,
            releaseDate: new Date().toISOString()
          });
          console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
          created++;
        }
        modified = true;
      } else {
        // Mettre à jour les versions existantes
        for (const version of tool.versions) {
          const duration = versionDurations[version.type];
          if (duration !== undefined) {
            version.supportDuration = duration;
            console.log(`  ✅ ${toolName} - ${version.type}: ${duration} mois`);
            modified = true;
            updated++;
          }
        }

        // Créer les versions manquantes
        for (const [type, duration] of Object.entries(versionDurations)) {
          if (!tool.versions.find((v: any) => v.type === type)) {
            tool.versions.push({
              type,
              label: 'N/A',
              supportDuration: duration,
              releaseDate: new Date().toISOString()
            });
            console.log(`  ✅ ${toolName} - ${type}: ${duration} mois (créé)`);
            created++;
            modified = true;
          }
        }
      }

      if (modified) {
        await tool.save();
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Versions mises à jour: ${updated}`);
    console.log(`  • Versions créées: ${created}`);

  } finally {
    await app.close();
  }
}

fixIaSupportDuration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
