import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function checkFinal() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    const c = await langageModel.findOne({ name: 'C' }).exec();
    const cpp = await langageModel.findOne({ name: 'C++' }).exec();

    console.log('📊 État final - C et C++\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🔹 C:');
    (c?.versions || []).forEach((v: any) => {
      console.log(`  ${v.type}: ${v.label}`);
    });

    console.log('\n🔹 C++:');
    (cpp?.versions || []).forEach((v: any) => {
      console.log(`  ${v.type}: ${v.label}`);
    });

    console.log('\n✅ Validation:');
    console.log('─────────────────────────────────────────────────────────');

    const cStandardCount = c?.versions?.filter((v: any) => v.type === 'standard').length || 0;
    const cppStandardCount = cpp?.versions?.filter((v: any) => v.type === 'standard').length || 0;

    if (cStandardCount === 1) {
      console.log('  ✅ C: Une seule entrée "standard" (pas de doublons)');
    } else {
      console.log(`  ❌ C: ${cStandardCount} entrées "standard" (doublons détectés)`);
    }

    if (cppStandardCount === 1) {
      console.log('  ✅ C++: Une seule entrée "standard" (pas de doublons)');
    } else {
      console.log(`  ❌ C++: ${cppStandardCount} entrées "standard" (doublons détectés)`);
    }

  } finally {
    await app.close();
  }
}

checkFinal().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
