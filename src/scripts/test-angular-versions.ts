import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LangageUpdateService } from '../langages/langage-update.service';
import { LangagesService } from '../langages/langages.service';

async function testAngularVersions() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const updateService = app.get(LangageUpdateService);
  const langagesService = app.get(LangagesService);

  console.log('🧪 Test de récupération des versions Angular...\n');

  try {
    // Synchroniser Angular
    const angularConfig = {
      nameInDb: 'Angular',
      sourceType: 'npm' as const,
      sourceUrl: '@angular/core',
      ltsSupport: true
    };

    console.log('📡 Récupération des versions depuis npm...');
    await updateService.updateFromNpm(angularConfig);

    // Récupérer les données depuis la base directement via le modèle
    console.log('📊 Versions stockées en base :');
    const langageModel = updateService['langageModel']; // Accès au modèle via le service
    const angular = await langageModel.findOne({ name: 'Angular' }).exec();

    if (angular) {
      console.log(`\n📦 ${angular.name} :`);
      angular.versions.forEach(version => {
        console.log(`  ${version.type}: ${version.label}${version.releaseDate ? ` (${new Date(version.releaseDate).toLocaleDateString()})` : ''}`);
      });
    } else {
      console.log('❌ Angular introuvable en base');
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
  } finally {
    await app.close();
  }
}

testAngularVersions().catch(console.error);