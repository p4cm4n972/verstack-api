import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkDatascienceDomain() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('📊 LANGAGES ET TOOLS DU DOMAINE "DATASCIENCE"\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const datascienceItems = await langageModel
      .find({ domain: 'datascience' })
      .sort({ name: 1 })
      .exec();

    // Catégoriser
    const languages: any[] = [];
    const frameworks: any[] = [];
    const tools: any[] = [];
    const others: any[] = [];

    datascienceItems.forEach((item: any) => {
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

    console.log(`📊 Total: ${datascienceItems.length} éléments\n`);

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
    console.log('\n\n💡 TECHNOLOGIES DATASCIENCE POPULAIRES À VÉRIFIER:');
    console.log('═══════════════════════════════════════════════════════════\n');

    const existingNames = datascienceItems.map((i: any) => i.name.toLowerCase());

    const suggestedDatascience = {
      'Langages': ['Python', 'R', 'Julia', 'Scala', 'MATLAB'],
      'ML/DL Frameworks': ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Keras', 'XGBoost', 'LightGBM', 'CatBoost'],
      'Data Processing': ['Pandas', 'NumPy', 'Polars', 'Dask', 'Apache Spark', 'Apache Flink'],
      'Visualization': ['Matplotlib', 'Seaborn', 'Plotly', 'Bokeh', 'D3.js', 'Tableau'],
      'Notebooks': ['Jupyter', 'JupyterLab', 'Google Colab', 'Databricks'],
      'MLOps': ['MLflow', 'Kubeflow', 'Airflow', 'DVC', 'Weights & Biases'],
      'Databases': ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'ClickHouse', 'DuckDB'],
      'Cloud ML': ['SageMaker', 'Azure ML', 'Google AI Platform', 'Vertex AI']
    };

    for (const [category, items] of Object.entries(suggestedDatascience)) {
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

checkDatascienceDomain().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
