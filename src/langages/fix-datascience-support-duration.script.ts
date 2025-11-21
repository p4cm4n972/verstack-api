import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixDatascienceSupportDuration() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 AJOUT DES SUPPORT DURATION POUR LES OUTILS DATASCIENCE\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Valeurs à appliquer (en mois)
    const supportDurations: Record<string, Record<string, number>> = {
      // ML/DL Frameworks - support moyen/long
      'TensorFlow': { 'current': 18 },
      'PyTorch': { 'current': 12 },
      'Scikit-learn': { 'current': 18 },
      'Keras': { 'current': 12 },
      'XGBoost': { 'current': 12 },
      'LightGBM': { 'current': 12 },

      // Data Processing
      'Pandas': { 'current': 12 },
      'NumPy': { 'current': 18 },
      'Apache Spark': { 'current': 18 },
      'Polars': { 'current': 6 },
      'Dask': { 'current': 12 },

      // Visualization
      'Matplotlib': { 'current': 18 },
      'Plotly': { 'current': 12 },
      'Seaborn': { 'current': 12 },

      // Notebooks
      'Jupyter': { 'current': 12 },

      // MLOps
      'MLflow': { 'current': 12 },
      'Airflow': { 'current': 18 },
      'DVC': { 'current': 6 }
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

fixDatascienceSupportDuration().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
