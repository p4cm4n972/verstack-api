import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function fixSuspiciousLogos() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔧 CORRECTION DES LOGOS SUSPECTS\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Map des logos à optimiser (remplacer Wikimedia et images sociales par des CDN optimisés)
    const logoFixes: Record<string, string> = {
      // Langages
      'Ansible': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ansible/ansible-original.svg',
      'Bash': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg',
      'Bootstrap': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bootstrap/bootstrap-original.svg',
      'C': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg',
      'C#': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg',
      'C++': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg',
      'Clojure': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/clojure/clojure-original.svg',
      'Electron': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/electron/electron-original.svg',
      'Go': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg',
      'Haskell': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/haskell/haskell-original.svg',
      'HTML': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
      'Java': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg',
      'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg',
      'Kotlin': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg',
      'PHP': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg',
      'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
      'R': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/r/r-original.svg',
      'Ruby': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg',
      'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',

      // Frameworks
      'Laravel': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg',
      'NestJS': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nestjs/nestjs-original.svg',
      'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
      'Spring': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg',
      'Svelte': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/svelte/svelte-original.svg',
      'Vue.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg',

      // Databases
      'MySQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg',
      'PostgreSQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg',

      // Tools
      'Apache Spark': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apachespark/apachespark-original.svg',
      'Kubernetes': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg',
      'Puppet': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/puppet/puppet-original.svg',
      'Terraform': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/terraform/terraform-original.svg',

      // Spécifiques
      'Babylon.js': 'https://doc.babylonjs.com/img/logo-babylonjs.svg',
      'DirectX': 'https://avatars.githubusercontent.com/u/6154722?s=200&v=4',
      'Godot': 'https://godotengine.org/assets/press/icon_color.svg',
      'JSON': 'https://www.json.org/img/json160.gif',
      'Keras': 'https://keras.io/img/logo.png',
      'MATLAB': 'https://www.mathworks.com/etc/designs/mathworks/img/pic-header-mathworks-logo2.svg',
      'Scikit-learn': 'https://scikit-learn.org/stable/_static/scikit-learn-logo-small.png',
      'SQL': 'https://cdn-icons-png.flaticon.com/512/4248/4248443.png',
      'TensorFlow Serving': 'https://www.gstatic.com/devrel-devsite/prod/v2210deb8920cd4a55bd580441aa58e7853afc04b39a9d9ac4198e1cd7fbe04ef/tensorflow/images/lockup.svg',
      'TFLite': 'https://www.gstatic.com/devrel-devsite/prod/v2210deb8920cd4a55bd580441aa58e7853afc04b39a9d9ac4198e1cd7fbe04ef/tensorflow/images/lockup.svg',
      'TensorRT': 'https://developer.nvidia.com/sites/default/files/akamai/tensorrt-badge-web.png',
      'Three.js': 'https://global.discourse-cdn.com/standard17/uploads/threejs/original/2X/e/e4f86d2200d2d35c30f7b1494e96b9595ebc2751.png',
      'WebAssembly': 'https://webassembly.org/css/webassembly.svg',
      'spaCy': 'https://raw.githubusercontent.com/explosion/spaCy/master/website/src/images/logo.svg'
    };

    let updated = 0;
    let failed = 0;

    for (const [name, newLogoUrl] of Object.entries(logoFixes)) {
      try {
        const result = await langageModel.updateOne(
          { name },
          { $set: { logoUrl: newLogoUrl } }
        ).exec();

        if (result.matchedCount > 0) {
          console.log(`  ✅ ${name}: logo optimisé`);
          updated++;
        } else {
          console.log(`  ⚠️  ${name}: non trouvé`);
          failed++;
        }
      } catch (error) {
        console.log(`  ❌ ${name}: erreur lors de la mise à jour`);
        failed++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`\n📊 Résumé:`);
    console.log(`  • Logos optimisés: ${updated}`);
    console.log(`  • Échecs: ${failed}`);
    console.log(`\n💡 Les logos utilisent maintenant des CDN optimisés (devicons, jsdelivr)`);

  } finally {
    await app.close();
  }
}

fixSuspiciousLogos().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
