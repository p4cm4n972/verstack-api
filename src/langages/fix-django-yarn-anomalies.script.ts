import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixDjangoYarnAnomalies() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES ANOMALIES DJANGO ET YARN\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Corriger Django - supprimer la version current erronée et la recréer
    console.log('📦 Django:');
    const django = await langageModel.findOne({ name: 'Django' }).exec();
    if (django) {
      // Supprimer la version current erronée (2010.0.0)
      django.versions = django.versions.filter((v: any) => v.type !== 'current' || v.label !== '2010.0.0');

      // Vérifier si une version current valide existe
      const hasValidCurrent = django.versions.some((v: any) => v.type === 'current' && v.label !== '2010.0.0');

      if (!hasValidCurrent) {
        // Ajouter une version current correcte (Django 5.1.4 latest stable)
        django.versions.push({
          type: 'current',
          label: '5.1.4',
          releaseDate: new Date('2025-01-02').toISOString(),
          supportDuration: 8
        });
        console.log('  ✅ Version current corrigée: 5.1.4');
      }

      await django.save();
      console.log('  ✅ Django mis à jour\n');
    } else {
      console.log('  ❌ Django non trouvé\n');
    }

    // Corriger Yarn - normaliser le label
    console.log('📦 Yarn:');
    const yarn = await langageModel.findOne({ name: 'Yarn' }).exec();
    if (yarn) {
      let modified = false;

      yarn.versions.forEach((v: any) => {
        if (v.label && v.label.startsWith('@yarnpkg/cli/')) {
          const oldLabel = v.label;
          v.label = v.label.replace('@yarnpkg/cli/', '');
          console.log(`  ✅ Version ${v.type} normalisée: ${oldLabel} → ${v.label}`);
          modified = true;
        }
      });

      if (modified) {
        await yarn.save();
        console.log('  ✅ Yarn mis à jour\n');
      } else {
        console.log('  ℹ️  Aucune modification nécessaire\n');
      }
    } else {
      console.log('  ❌ Yarn non trouvé\n');
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n✅ Corrections appliquées');
    console.log('\n💡 Note: Pour Django, la synchronisation PyPI récupèrera les bonnes versions.');
    console.log('💡 Note: Pour Yarn, le normalizeLabel devrait gérer cela automatiquement.');

  } finally {
    await app.close();
  }
}

fixDjangoYarnAnomalies().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
