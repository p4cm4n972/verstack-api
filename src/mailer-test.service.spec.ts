import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { MailerTestService } from './mailer-test.service';

describe('MailerTestService', () => {
  let service: MailerTestService;
  const mailService = { sendTestEmail: jest.fn() } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerTestService,
        { provide: MailService, useValue: mailService },
      ],
    }).compile();

    service = module.get<MailerTestService>(MailerTestService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return success when sending email succeeds', async () => {
    mailService.sendTestEmail.mockResolvedValue({
      success: true,
      message: 'Email envoyé avec succès !',
    });

    const result = await service.sendTestEmail('test@example.com');

    expect(mailService.sendTestEmail).toHaveBeenCalledWith('test@example.com');
    expect(result).toEqual({
      success: true,
      message: 'Email envoyé avec succès !',
    });
  });

  it('should return failure when sendTestEmail throws', async () => {
    mailService.sendTestEmail.mockResolvedValue({
      success: false,
      message: 'boom',
    });

    const result = await service.sendTestEmail('fail@example.com');

    expect(result).toEqual({ success: false, message: 'boom' });
  });
});
