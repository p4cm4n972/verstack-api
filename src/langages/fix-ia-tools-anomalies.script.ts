import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixIAToolsAnomalies() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES ANOMALIES IA TOOLS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // LangChain - normaliser langchain-core==1.1.0 → 1.1.0
    console.log('📦 LangChain:');
    const langchain = await langageModel.findOne({ name: 'LangChain' }).exec();
    if (langchain) {
      let modified = false;
      langchain.versions.forEach((v: any) => {
        if (v.label && v.label.includes('langchain-core==')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^.*langchain-core==/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await langchain.save();
        console.log('  ✅ LangChain mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ LangChain non trouvé\n');
    }

    // Semantic Kernel - normaliser python-1.38.0 → 1.38.0
    console.log('📦 Semantic Kernel:');
    const semanticKernel = await langageModel.findOne({ name: 'Semantic Kernel' }).exec();
    if (semanticKernel) {
      let modified = false;
      semanticKernel.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('python-')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^python-/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await semanticKernel.save();
        console.log('  ✅ Semantic Kernel mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Semantic Kernel non trouvé\n');
    }

    // spaCy - normaliser release-v3.8.11 → 3.8.11
    console.log('📦 spaCy:');
    const spacy = await langageModel.findOne({ name: 'spaCy' }).exec();
    if (spacy) {
      let modified = false;
      spacy.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('release-v')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^release-v/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await spacy.save();
        console.log('  ✅ spaCy mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ spaCy non trouvé\n');
    }

    // Albumentations - définir une version réelle
    console.log('📦 Albumentations:');
    const albumentations = await langageModel.findOne({ name: 'Albumentations' }).exec();
    if (albumentations) {
      const currentVersion = albumentations.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '1.4.23';
        currentVersion.releaseDate = new Date('2025-11-03').toISOString();
        await albumentations.save();
        console.log('  ✅ Version current définie: 1.4.23\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ Albumentations non trouvé\n');
    }

    // NLTK - définir une version réelle
    console.log('📦 NLTK:');
    const nltk = await langageModel.findOne({ name: 'NLTK' }).exec();
    if (nltk) {
      const currentVersion = nltk.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '3.9.1';
        currentVersion.releaseDate = new Date('2024-10-07').toISOString();
        await nltk.save();
        console.log('  ✅ Version current définie: 3.9.1\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ NLTK non trouvé\n');
    }

    // H2O.ai - définir une version réelle
    console.log('📦 H2O.ai:');
    const h2o = await langageModel.findOne({ name: 'H2O.ai' }).exec();
    if (h2o) {
      const currentVersion = h2o.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '3.46.0.6';
        currentVersion.releaseDate = new Date('2024-11-01').toISOString();
        await h2o.save();
        console.log('  ✅ Version current définie: 3.46.0.6\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ H2O.ai non trouvé\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ Corrections appliquées');
    console.log('\n💡 Note: Les normalizeLabel géreront automatiquement les futures versions.');

  } finally {
    await app.close();
  }
}

fixIAToolsAnomalies().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
