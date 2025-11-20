import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Model } from 'mongoose';

async function addEmbeddedEssentials() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const langageModel = app.get<Model<any>>('LangageModel');

    console.log('🔌 AJOUT DES ESSENTIELS ET IMPORTANTS POUR LE DOMAINE EMBEDDED\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    const embeddedItems = [
      // === ESSENTIELS ===
      // RTOS
      {
        name: 'FreeRTOS',
        domain: ['embedded', 'tools'],
        description: 'Système d\'exploitation temps réel open-source pour microcontrôleurs',
        logoUrl: 'https://www.freertos.org/fr-fr-site-images/logo/FREERTOS_logo_RGB.png',
        documentation: 'https://www.freertos.org/Documentation/RTOS_book.html',
        initialRelease: '2003',
        versions: []
      },
      {
        name: 'Zephyr',
        domain: ['embedded', 'tools'],
        description: 'RTOS open-source scalable pour appareils IoT et embedded',
        logoUrl: 'https://docs.zephyrproject.org/latest/_static/images/logo-readme.png',
        documentation: 'https://docs.zephyrproject.org/',
        initialRelease: '2016',
        versions: []
      },
      // Frameworks/HAL
      {
        name: 'Arduino',
        domain: ['embedded', 'framework', 'tools'],
        description: 'Plateforme de prototypage électronique open-source',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/arduino/arduino-original.svg',
        documentation: 'https://docs.arduino.cc/',
        initialRelease: '2005',
        versions: []
      },
      {
        name: 'ESP-IDF',
        domain: ['embedded', 'framework'],
        description: 'Framework officiel pour développer sur ESP32',
        logoUrl: 'https://docs.espressif.com/projects/esp-idf/en/latest/esp32/_static/espressif-logo.svg',
        documentation: 'https://docs.espressif.com/projects/esp-idf/',
        initialRelease: '2016',
        versions: []
      },
      {
        name: 'Mbed OS',
        domain: ['embedded', 'tools'],
        description: 'OS open-source pour IoT basé sur ARM Cortex-M',
        logoUrl: 'https://os.mbed.com/static/img/mbed-logo.png',
        documentation: 'https://os.mbed.com/docs/',
        initialRelease: '2014',
        versions: []
      },
      // Build & Tools
      {
        name: 'PlatformIO',
        domain: ['embedded', 'tools', 'devops'],
        description: 'Écosystème professionnel pour développement embedded',
        logoUrl: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/platformio/platformio-original.svg',
        documentation: 'https://docs.platformio.org/',
        initialRelease: '2014',
        versions: []
      },
      // Protocols
      {
        name: 'MQTT',
        domain: ['embedded', 'backend', 'tools'],
        description: 'Protocole de messagerie léger pour IoT',
        logoUrl: 'https://mqtt.org/assets/img/mqtt-logo-transp.svg',
        documentation: 'https://mqtt.org/getting-started/',
        initialRelease: '1999',
        versions: []
      },

      // === IMPORTANTS ===
      // RTOS
      {
        name: 'RT-Thread',
        domain: ['embedded', 'tools'],
        description: 'RTOS open-source pour appareils IoT',
        logoUrl: 'https://www.rt-thread.io/static/image/logo.png',
        documentation: 'https://www.rt-thread.io/document/site/',
        initialRelease: '2006',
        versions: []
      },
      {
        name: 'RIOT OS',
        domain: ['embedded', 'tools'],
        description: 'OS temps réel pour IoT avec support réseau',
        logoUrl: 'https://www.riot-os.org/images/logo-square.png',
        documentation: 'https://doc.riot-os.org/',
        initialRelease: '2013',
        versions: []
      },
      // Frameworks/HAL
      {
        name: 'STM32Cube',
        domain: ['embedded', 'framework'],
        description: 'Suite de développement STMicroelectronics pour STM32',
        logoUrl: 'https://www.st.com/etc/clientlibs/st-site/media/app/images/st-logo-header.png',
        documentation: 'https://www.st.com/en/ecosystems/stm32cube.html',
        initialRelease: '2014',
        versions: []
      },
      {
        name: 'Nordic SDK',
        domain: ['embedded', 'framework'],
        description: 'SDK pour développer sur microcontrôleurs Nordic nRF',
        logoUrl: 'https://www.nordicsemi.com/-/media/Images/Products/DevZone/nRF-Connect-SDK/NordicSemiconductor_nRF_Connect_SDK_RGB.png',
        documentation: 'https://www.nordicsemi.com/Products/Development-software/nrf-connect-sdk',
        initialRelease: '2019',
        versions: []
      },
      // Build & Tools
      {
        name: 'OpenOCD',
        domain: ['embedded', 'tools'],
        description: 'Outil de débogage on-chip open-source',
        logoUrl: 'https://openocd.org/openocd.svg',
        documentation: 'https://openocd.org/doc/',
        initialRelease: '2005',
        versions: []
      },
      // Protocols
      {
        name: 'CoAP',
        domain: ['embedded', 'backend', 'tools'],
        description: 'Protocole applicatif pour appareils contraints',
        logoUrl: 'https://coap.technology/images/coap-logo.svg',
        documentation: 'https://coap.technology/',
        initialRelease: '2014',
        versions: []
      },
      {
        name: 'Modbus',
        domain: ['embedded', 'tools'],
        description: 'Protocole de communication industriel série',
        logoUrl: 'https://modbus.org/images/modbus-logo.png',
        documentation: 'https://modbus.org/specs.php',
        initialRelease: '1979',
        versions: []
      },
      // Testing
      {
        name: 'Unity',
        domain: ['embedded', 'tools'],
        description: 'Framework de tests unitaires pour C (embedded)',
        logoUrl: 'https://www.throwtheswitch.org/assets/images/logo.png',
        documentation: 'https://www.throwtheswitch.org/unity',
        initialRelease: '2007',
        versions: []
      },
      {
        name: 'CppUTest',
        domain: ['embedded', 'tools'],
        description: 'Framework de tests unitaires pour C/C++ embedded',
        logoUrl: 'https://cpputest.github.io/images/cpputest_logo.png',
        documentation: 'https://cpputest.github.io/',
        initialRelease: '2007',
        versions: []
      },

      // Update existing languages to add embedded domain
      { name: 'Assembly', addEmbeddedOnly: true },
      { name: 'Ada', addEmbeddedOnly: true }
    ];

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of embeddedItems) {
      const existing = await langageModel.findOne({ name: item.name }).exec();

      if (existing) {
        if (item.addEmbeddedOnly) {
          if (!existing.domain.includes('embedded')) {
            await langageModel.updateOne(
              { name: item.name },
              { $addToSet: { domain: 'embedded' } }
            ).exec();
            console.log(`  ✅ ${item.name}: domaine 'embedded' ajouté`);
            updated++;
          } else {
            console.log(`  ⏭️  ${item.name}: déjà dans le domaine embedded`);
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
        if (!item.addEmbeddedOnly) {
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
    console.log(`  • Total traité: ${embeddedItems.length}`);

  } finally {
    await app.close();
  }
}

addEmbeddedEssentials().catch(error => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});
