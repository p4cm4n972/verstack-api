import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixVariousAnomalies() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES ANOMALIES DIVERSES\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Perl - corriger la version corrompue 2009.0.0
    console.log('📦 Perl:');
    const perl = await langageModel.findOne({ name: 'Perl' }).exec();
    if (perl) {
      const currentVersion = perl.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === '2009.0.0') {
        currentVersion.label = '5.40.0';
        currentVersion.releaseDate = new Date('2024-06-09').toISOString();
        await perl.save();
        console.log('  ✅ Version current corrigée: 5.40.0\n');
      } else {
        console.log('  ℹ️  Version déjà correcte\n');
      }
    } else {
      console.log('  ❌ Perl non trouvé\n');
    }

    // Haskell - corriger la version corrompue 11550.0.0
    console.log('📦 Haskell:');
    const haskell = await langageModel.findOne({ name: 'Haskell' }).exec();
    if (haskell) {
      const currentVersion = haskell.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === '11550.0.0') {
        currentVersion.label = '9.10.1';
        currentVersion.releaseDate = new Date('2024-07-07').toISOString();
        await haskell.save();
        console.log('  ✅ Version current corrigée: 9.10.1 (GHC)\n');
      } else {
        console.log('  ℹ️  Version déjà correcte\n');
      }
    } else {
      console.log('  ❌ Haskell non trouvé\n');
    }

    // Apache Spark - définir une version réelle
    console.log('📦 Apache Spark:');
    const spark = await langageModel.findOne({ name: 'Apache Spark' }).exec();
    if (spark) {
      const currentVersion = spark.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === 'N/A') {
        currentVersion.label = '3.5.3';
        currentVersion.releaseDate = new Date('2024-08-20').toISOString();
        await spark.save();
        console.log('  ✅ Version current définie: 3.5.3\n');
      } else {
        console.log('  ℹ️  Version déjà définie\n');
      }
    } else {
      console.log('  ❌ Apache Spark non trouvé\n');
    }

    // Jupyter - corriger la version invalide 0.0.0
    console.log('📦 Jupyter:');
    const jupyter = await langageModel.findOne({ name: 'Jupyter' }).exec();
    if (jupyter) {
      const currentVersion = jupyter.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === '0.0.0') {
        currentVersion.label = '1.1.1';
        currentVersion.releaseDate = new Date('2024-07-31').toISOString();
        await jupyter.save();
        console.log('  ✅ Version current corrigée: 1.1.1 (jupyter-core)\n');
      } else {
        console.log('  ℹ️  Version déjà correcte\n');
      }
    } else {
      console.log('  ❌ Jupyter non trouvé\n');
    }

    // Polars - normaliser py-1.35.2 → 1.35.2
    console.log('📦 Polars:');
    const polars = await langageModel.findOne({ name: 'Polars' }).exec();
    if (polars) {
      let modified = false;
      polars.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('py-')) {
          const oldLabel = v.label;
          v.label = v.label.replace(/^py-/, '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });
      if (modified) {
        await polars.save();
        console.log('  ✅ Polars mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Polars non trouvé\n');
    }

    // Seaborn - corriger le package npm malveillant
    console.log('📦 Seaborn:');
    const seaborn = await langageModel.findOne({ name: 'Seaborn' }).exec();
    if (seaborn) {
      const currentVersion = seaborn.versions.find((v: any) => v.type === 'current');
      if (currentVersion && currentVersion.label === '0.0.1-security') {
        currentVersion.label = '0.13.2';
        currentVersion.releaseDate = new Date('2024-01-12').toISOString();
        await seaborn.save();
        console.log('  ✅ Version current corrigée: 0.13.2 (npm malveillant supprimé)\n');
      } else {
        console.log('  ℹ️  Version déjà correcte\n');
      }
    } else {
      console.log('  ❌ Seaborn non trouvé\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ Corrections appliquées');
    console.log('\n💡 Note: Le normalizeLabel pour Polars gérera automatiquement les futures versions.');

  } finally {
    await app.close();
  }
}

fixVariousAnomalies().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
