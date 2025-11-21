import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function addDatascienceEssentials() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('📊 AJOUT DES ESSENTIELS ET IMPORTANTS POUR LE DOMAINE DATASCIENCE\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const datascienceItems = [
      // === ESSENTIELS ===
      // ML/DL Frameworks
      {
        name: 'TensorFlow',
        domain: ['datascience', 'ia', 'framework'],
        description: 'Framework de machine learning open-source de Google',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg',
        documentation: 'https://www.tensorflow.org/api_docs',
        initialRelease: '2015',
        versions: []
      },
      {
        name: 'PyTorch',
        domain: ['datascience', 'ia', 'framework'],
        description: 'Framework de deep learning flexible développé par Meta',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg',
        documentation: 'https://pytorch.org/docs/',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'Scikit-learn',
        domain: ['datascience', 'framework'],
        description: 'Bibliothèque de machine learning pour Python',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg',
        documentation: 'https://scikit-learn.org/stable/documentation.html',
        initialRelease: '2007',
        versions: []
      },
      {
        name: 'Keras',
        domain: ['datascience', 'ia', 'framework'],
        description: 'API de deep learning haut niveau pour Python',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ae/Keras_logo.svg',
        documentation: 'https://keras.io/api/',
        initialRelease: '2015',
        versions: []
      },
      // Data Processing
      {
        name: 'Pandas',
        domain: ['datascience', 'tools'],
        description: 'Bibliothèque de manipulation et analyse de données pour Python',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pandas/pandas-original.svg',
        documentation: 'https://pandas.pydata.org/docs/',
        initialRelease: '2008',
        versions: []
      },
      {
        name: 'NumPy',
        domain: ['datascience', 'tools'],
        description: 'Bibliothèque de calcul scientifique pour Python',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/numpy/numpy-original.svg',
        documentation: 'https://numpy.org/doc/',
        initialRelease: '2006',
        versions: []
      },
      {
        name: 'Apache Spark',
        domain: ['datascience', 'backend', 'tools'],
        description: 'Moteur de traitement de données distribuées',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f3/Apache_Spark_logo.svg',
        documentation: 'https://spark.apache.org/docs/latest/',
        initialRelease: '2014',
        versions: []
      },
      // Visualization
      {
        name: 'Matplotlib',
        domain: ['datascience', 'tools'],
        description: 'Bibliothèque de visualisation pour Python',
        logoUrl: 'https://matplotlib.org/stable/_static/logo_dark.svg',
        documentation: 'https://matplotlib.org/stable/contents.html',
        initialRelease: '2003',
        versions: []
      },
      {
        name: 'Plotly',
        domain: ['datascience', 'web', 'tools'],
        description: 'Bibliothèque de visualisation interactive',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/plotly/plotly-original.svg',
        documentation: 'https://plotly.com/python/',
        initialRelease: '2012',
        versions: []
      },
      // Notebooks
      {
        name: 'Jupyter',
        domain: ['datascience', 'tools'],
        description: 'Environnement de notebooks interactifs',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jupyter/jupyter-original.svg',
        documentation: 'https://jupyter.org/documentation',
        initialRelease: '2014',
        versions: []
      },

      // === IMPORTANTS ===
      // ML Frameworks
      {
        name: 'XGBoost',
        domain: ['datascience', 'framework'],
        description: 'Bibliothèque de gradient boosting optimisée',
        logoUrl: 'https://raw.githubusercontent.com/dmlc/dmlc.github.io/master/img/logo-m/xgboost.png',
        documentation: 'https://xgboost.readthedocs.io/',
        initialRelease: '2014',
        versions: []
      },
      {
        name: 'LightGBM',
        domain: ['datascience', 'framework'],
        description: 'Framework de gradient boosting développé par Microsoft',
        logoUrl: 'https://lightgbm.readthedocs.io/en/latest/_static/LightGBM_logo_grey_text.svg',
        documentation: 'https://lightgbm.readthedocs.io/',
        initialRelease: '2016',
        versions: []
      },
      // Data Processing
      {
        name: 'Polars',
        domain: ['datascience', 'tools'],
        description: 'DataFrame rapide en Rust pour Python',
        logoUrl: 'https://raw.githubusercontent.com/pola-rs/polars-static/master/logos/polars-logo-dark.svg',
        documentation: 'https://pola-rs.github.io/polars/py-polars/html/',
        initialRelease: '2020',
        versions: []
      },
      {
        name: 'Dask',
        domain: ['datascience', 'tools'],
        description: 'Bibliothèque de calcul parallèle pour Python',
        logoUrl: 'https://docs.dask.org/en/stable/_images/dask_horizontal.svg',
        documentation: 'https://docs.dask.org/',
        initialRelease: '2014',
        versions: []
      },
      // Visualization
      {
        name: 'Seaborn',
        domain: ['datascience', 'tools'],
        description: 'Bibliothèque de visualisation statistique basée sur Matplotlib',
        logoUrl: 'https://seaborn.pydata.org/_static/logo-wide-lightbg.svg',
        documentation: 'https://seaborn.pydata.org/',
        initialRelease: '2012',
        versions: []
      },
      // MLOps
      {
        name: 'MLflow',
        domain: ['datascience', 'devops', 'tools'],
        description: 'Plateforme open-source pour le cycle de vie ML',
        logoUrl: 'https://www.mlflow.org/docs/latest/_static/MLflow-logo-final-black.png',
        documentation: 'https://mlflow.org/docs/latest/index.html',
        initialRelease: '2018',
        versions: []
      },
      {
        name: 'Airflow',
        domain: ['datascience', 'devops', 'tools'],
        description: 'Plateforme d\'orchestration de workflows',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg',
        documentation: 'https://airflow.apache.org/docs/',
        initialRelease: '2014',
        versions: []
      },
      {
        name: 'DVC',
        domain: ['datascience', 'devops', 'tools'],
        description: 'Contrôle de version pour data science et ML',
        logoUrl: 'https://dvc.org/img/logo-github-readme.png',
        documentation: 'https://dvc.org/doc',
        initialRelease: '2017',
        versions: []
      },

      // Update existing databases to add datascience domain
      { name: 'PostgreSQL', addDatascienceOnly: true },
      { name: 'MongoDB', addDatascienceOnly: true },
      { name: 'Redis', addDatascienceOnly: true }
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of datascienceItems) {
      const existing = await langageModel.findOne({ name: item.name }).exec();

      if (existing) {
        if (item.addDatascienceOnly) {
          if (!existing.domain.includes('datascience')) {
            await langageModel.updateOne(
              { name: item.name },
              { $addToSet: { domain: 'datascience' } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaine 'datascience' ajouté`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: déjà dans le domaine datascience`);
            skipped++;
          }
        } else {
          const newDomains = [...new Set([...existing.domain, ...(item.domain || [])])];
          if (newDomains.length !== existing.domain.length) {
            await langageModel.updateOne(
              { name: item.name },
              { $set: { domain: newDomains } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaines mis à jour`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: existe déjà avec les bons domaines`);
            skipped++;
          }
        }
      } else {
        if (!item.addDatascienceOnly) {
          const newItem = {
            name: item.name,
            domain: item.domain,
            description: item.description || '',
            logoUrl: item.logoUrl || '',
            documentation: item.documentation || '',
            initialRelease: item.initialRelease || '',
            versions: item.versions || [],
            recommendations: 0
          };

          await langageModel.create(newItem);
          console.log(`  ✅ ${item.name}: créé`);
          created++;
        } else {
          console.log(`  ⚠️  ${item.name}: n'existe pas en base`);
          skipped++;
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Créés: ${created}`);
    console.log(`  • Mis à jour: ${updated}`);
    console.log(`  • Ignorés: ${skipped}`);
    console.log(`  • Total traité: ${datascienceItems.length}`);

  } finally {
    await app.close();
  }
}

addDatascienceEssentials().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
