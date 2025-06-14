import { Test, TestingModule } from '@nestjs/testing';
import { MailerService } from '@nestjs-modules/mailer';
import { MailerTestService } from './mailer-test.service';

describe('MailerTestService', () => {
  let service: MailerTestService;
  const mailer = { sendMail: jest.fn() } as any;

  beforeEach(async () => {
    process.env.MAIL_FROM = 'from@example.com';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerTestService,
        { provide: MailerService, useValue: mailer },
      ],
    }).compile();

    service = module.get<MailerTestService>(MailerTestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return success when sending email succeeds', async () => {
    mailer.sendMail.mockResolvedValue(undefined);

    const result = await service.sendTestEmail('test@example.com');

    expect(mailer.sendMail).toHaveBeenCalledWith({
      to: 'test@example.com',
      from: '"Verstack" <from@example.com>',
      subject: '✅ Test d’envoi depuis NestJS via Brevo',
      html: `<p>Si tu vois ce mail, c’est que tout fonctionne bien 🚀</p>`,
    });
    expect(result).toEqual({
      success: true,
      message: 'Email envoyé avec succès !',
    });
  });

  it('should return failure when sendMail throws', async () => {
    const error = new Error('boom');
    mailer.sendMail.mockRejectedValue(error);
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await service.sendTestEmail('fail@example.com');

    expect(spy).toHaveBeenCalledWith('Erreur d’envoi :', error);
    expect(result).toEqual({ success: false, message: 'boom' });

    spy.mockRestore();
  });
});
