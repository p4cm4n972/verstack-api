import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function addIaEssentials() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🤖 AJOUT DES ESSENTIELS ET IMPORTANTS POUR LE DOMAINE IA\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const iaItems = [
      // === ESSENTIELS ===
      // LLM Frameworks
      {
        name: 'LangChain',
        domain: ['ia', 'framework'],
        description: 'Framework pour développer des applications LLM',
        logoUrl: 'https://avatars.githubusercontent.com/u/126733545?s=200&v=4',
        documentation: 'https://python.langchain.com/docs/introduction/',
        initialRelease: '2022',
        versions: []
      },
      {
        name: 'LlamaIndex',
        domain: ['ia', 'framework'],
        description: 'Framework de data pour connecter des LLM à vos données',
        logoUrl: 'https://avatars.githubusercontent.com/u/130722866?s=200&v=4',
        documentation: 'https://docs.llamaindex.ai/',
        initialRelease: '2022',
        versions: []
      },
      // Computer Vision
      {
        name: 'OpenCV',
        domain: ['ia', 'tools'],
        description: 'Bibliothèque de computer vision open-source',
        logoUrl: 'https://opencv.org/wp-content/uploads/2020/07/OpenCV_logo_black-2.png',
        documentation: 'https://docs.opencv.org/',
        initialRelease: '2000',
        versions: []
      },
      // NLP
      {
        name: 'spaCy',
        domain: ['ia', 'tools'],
        description: 'Bibliothèque de traitement du langage naturel industrielle',
        logoUrl: 'https://spacy.io/static/social_default-1d3b50b1eba4c2b06244425ff0c49570.jpg',
        documentation: 'https://spacy.io/api',
        initialRelease: '2015',
        versions: []
      },
      {
        name: 'Transformers',
        domain: ['ia', 'framework'],
        description: 'Bibliothèque Hugging Face pour les modèles de transformers',
        logoUrl: 'https://huggingface.co/front/assets/huggingface_logo-noborder.svg',
        documentation: 'https://huggingface.co/docs/transformers/',
        initialRelease: '2018',
        versions: []
      },
      // Vector Databases
      {
        name: 'Pinecone',
        domain: ['ia', 'database', 'tools'],
        description: 'Base de données vectorielle managée pour embeddings',
        logoUrl: 'https://avatars.githubusercontent.com/u/49722888?s=200&v=4',
        documentation: 'https://docs.pinecone.io/',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'Weaviate',
        domain: ['ia', 'database', 'tools'],
        description: 'Base de données vectorielle open-source',
        logoUrl: 'https://weaviate.io/img/site/weaviate-logo-light.png',
        documentation: 'https://weaviate.io/developers/weaviate',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'Chroma',
        domain: ['ia', 'database', 'tools'],
        description: 'Base de données vectorielle AI-native open-source',
        logoUrl: 'https://avatars.githubusercontent.com/u/103701018?s=200&v=4',
        documentation: 'https://docs.trychroma.com/',
        initialRelease: '2022',
        versions: []
      },
      // Model Formats
      {
        name: 'ONNX',
        domain: ['ia', 'tools'],
        description: 'Format ouvert pour représenter les modèles de machine learning',
        logoUrl: 'https://onnx.ai/images/ONNX-logo.png',
        documentation: 'https://onnx.ai/onnx/',
        initialRelease: '2017',
        versions: []
      },
      // Model Serving
      {
        name: 'ONNX Runtime',
        domain: ['ia', 'tools'],
        description: 'Runtime cross-platform haute performance pour inférence ML',
        logoUrl: 'https://onnxruntime.ai/images/ONNX-Runtime-logo.png',
        documentation: 'https://onnxruntime.ai/docs/',
        initialRelease: '2018',
        versions: []
      },

      // === IMPORTANTS ===
      // LLM Frameworks
      {
        name: 'Haystack',
        domain: ['ia', 'framework'],
        description: 'Framework NLP pour créer des applications avec LLM',
        logoUrl: 'https://avatars.githubusercontent.com/u/51827949?s=200&v=4',
        documentation: 'https://docs.haystack.deepset.ai/',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'Semantic Kernel',
        domain: ['ia', 'framework'],
        description: 'SDK Microsoft pour intégrer des LLM dans des apps',
        logoUrl: 'https://avatars.githubusercontent.com/u/123265896?s=200&v=4',
        documentation: 'https://learn.microsoft.com/en-us/semantic-kernel/',
        initialRelease: '2023',
        versions: []
      },
      // Computer Vision
      {
        name: 'YOLO',
        domain: ['ia', 'framework'],
        description: 'Framework de détection d\'objets en temps réel',
        logoUrl: 'https://raw.githubusercontent.com/ultralytics/assets/main/logo/Ultralytics_Logotype_Original.svg',
        documentation: 'https://docs.ultralytics.com/',
        initialRelease: '2015',
        versions: []
      },
      {
        name: 'Albumentations',
        domain: ['ia', 'tools'],
        description: 'Bibliothèque d\'augmentation d\'images pour computer vision',
        logoUrl: 'https://avatars.githubusercontent.com/u/45040318?s=200&v=4',
        documentation: 'https://albumentations.ai/docs/',
        initialRelease: '2018',
        versions: []
      },
      // NLP
      {
        name: 'NLTK',
        domain: ['ia', 'tools'],
        description: 'Natural Language Toolkit pour Python',
        logoUrl: 'https://miro.medium.com/v2/resize:fit:592/1*YM2HXc7f4v02pZBEO8h-qw.png',
        documentation: 'https://www.nltk.org/',
        initialRelease: '2001',
        versions: []
      },
      {
        name: 'Gensim',
        domain: ['ia', 'tools'],
        description: 'Bibliothèque de topic modeling et NLP',
        logoUrl: 'https://radimrehurek.com/gensim/_static/images/gensim.png',
        documentation: 'https://radimrehurek.com/gensim/',
        initialRelease: '2009',
        versions: []
      },
      // Vector Databases
      {
        name: 'Milvus',
        domain: ['ia', 'database', 'tools'],
        description: 'Base de données vectorielle cloud-native open-source',
        logoUrl: 'https://avatars.githubusercontent.com/u/39545759?s=200&v=4',
        documentation: 'https://milvus.io/docs',
        initialRelease: '2019',
        versions: []
      },
      {
        name: 'Qdrant',
        domain: ['ia', 'database', 'tools'],
        description: 'Base de données vectorielle haute performance',
        logoUrl: 'https://avatars.githubusercontent.com/u/73504361?s=200&v=4',
        documentation: 'https://qdrant.tech/documentation/',
        initialRelease: '2021',
        versions: []
      },
      // Model Serving
      {
        name: 'TensorFlow Serving',
        domain: ['ia', 'tools'],
        description: 'Système de serving de modèles TensorFlow pour production',
        logoUrl: 'https://www.tensorflow.org/static/site-assets/images/project-logos/tensorflow-serving-logo-social.png',
        documentation: 'https://www.tensorflow.org/tfx/guide/serving',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'TorchServe',
        domain: ['ia', 'tools'],
        description: 'Outil de serving de modèles PyTorch',
        logoUrl: 'https://pytorch.org/serve/_static/img/torchserve-logo.png',
        documentation: 'https://pytorch.org/serve/',
        initialRelease: '2020',
        versions: []
      },
      {
        name: 'Triton',
        domain: ['ia', 'tools'],
        description: 'Serveur d\'inférence NVIDIA pour deep learning',
        logoUrl: 'https://raw.githubusercontent.com/triton-inference-server/server/main/docs/images/triton-logo.png',
        documentation: 'https://docs.nvidia.com/deeplearning/triton-inference-server/',
        initialRelease: '2018',
        versions: []
      },
      // Model Formats
      {
        name: 'TensorRT',
        domain: ['ia', 'tools'],
        description: 'Plateforme d\'optimisation d\'inférence NVIDIA',
        logoUrl: 'https://developer.nvidia.com/sites/default/files/akamai/tensorrt-logo-1200.png',
        documentation: 'https://docs.nvidia.com/deeplearning/tensorrt/',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'CoreML',
        domain: ['ia', 'tools'],
        description: 'Framework de machine learning d\'Apple',
        logoUrl: 'https://developer.apple.com/assets/elements/icons/core-ml/core-ml-96x96_2x.png',
        documentation: 'https://developer.apple.com/documentation/coreml',
        initialRelease: '2017',
        versions: []
      },
      {
        name: 'TFLite',
        domain: ['ia', 'tools'],
        description: 'TensorFlow Lite pour inférence sur mobile/edge',
        logoUrl: 'https://www.tensorflow.org/static/site-assets/images/project-logos/tensorflow-lite-logo-social.png',
        documentation: 'https://www.tensorflow.org/lite',
        initialRelease: '2017',
        versions: []
      },
      // AutoML
      {
        name: 'Auto-sklearn',
        domain: ['ia', 'tools'],
        description: 'AutoML basé sur scikit-learn',
        logoUrl: 'https://automl.github.io/auto-sklearn/master/_static/logo.png',
        documentation: 'https://automl.github.io/auto-sklearn/',
        initialRelease: '2015',
        versions: []
      },
      {
        name: 'H2O.ai',
        domain: ['ia', 'tools'],
        description: 'Plateforme open-source de machine learning et AutoML',
        logoUrl: 'https://h2o.ai/wp-content/uploads/2021/07/h2o-logo.svg',
        documentation: 'https://docs.h2o.ai/',
        initialRelease: '2011',
        versions: []
      },
      // Reinforcement Learning
      {
        name: 'Stable Baselines3',
        domain: ['ia', 'framework'],
        description: 'Implémentations fiables d\'algorithmes de RL',
        logoUrl: 'https://stable-baselines3.readthedocs.io/en/master/_static/logo.png',
        documentation: 'https://stable-baselines3.readthedocs.io/',
        initialRelease: '2020',
        versions: []
      },
      {
        name: 'OpenAI Gym',
        domain: ['ia', 'tools'],
        description: 'Toolkit pour développer des algorithmes de RL',
        logoUrl: 'https://gymnasium.farama.org/_static/img/gymnasium_black.svg',
        documentation: 'https://gymnasium.farama.org/',
        initialRelease: '2016',
        versions: []
      },

      // Update existing to add ia domain
      { name: 'Scikit-learn', addIaOnly: true }
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of iaItems) {
      const existing = await langageModel.findOne({ name: item.name }).exec();

      if (existing) {
        if (item.addIaOnly) {
          if (!existing.domain.includes('ia')) {
            await langageModel.updateOne(
              { name: item.name },
              { $addToSet: { domain: 'ia' } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaine 'ia' ajouté`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: déjà dans le domaine ia`);
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
        if (!item.addIaOnly) {
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
    console.log(`  • Total traité: ${iaItems.length}`);

  } finally {
    await app.close();
  }
}

addIaEssentials().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
