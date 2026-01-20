
import { User, TestResult } from '../types';

export const emailService = {
  sendTestResult: async (user: User, result: TestResult) => {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const emailBody = `
      GERMISTON BAPTIST CHURCH - CHILD PROTECTION TEST RESULT
      ------------------------------------------------------
      Staff Member: ${user.name}
      Email: ${user.email}
      Date: ${new Date(result.date).toLocaleString()}
      Score: ${result.score}%
      Status: ${result.passed ? 'PASSED (PASSING GRADE IS 80%)' : 'FAILED - RETRY REQUIRED'}
      Test Format: 20 random questions from a pool of 50 unique items
      
      Total attempts for this user: ${user.testAttempts.length}
      ------------------------------------------------------
      Detailed breakdown:
      ${result.questionDetails.map((q, i) => `Q${i+1}: ${q.isCorrect ? 'Correct' : 'Incorrect'} (${q.attempts} attempt(s))`).join('\n')}
    `;

    console.group('MOCK EMAIL SENT');
    console.log('TO:', user.email);
    console.log('CC:', 'lexicon.sm@gmail.com');
    console.log('SUBJECT:', `GBC Child Protection Test: ${result.passed ? 'PASSED' : 'FAILED'} - ${user.name}`);
    console.log('BODY:', emailBody);
    console.groupEnd();

    return true;
  },

  sendAccountDeletedEmail: async (user: User) => {
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const emailBody = `
      GERMISTON BAPTIST CHURCH - ACCOUNT DELETION NOTICE
      ------------------------------------------------------
      Dear ${user.name},

      This is a formal notification that your access to the GBC Child Protection Portal 
      has been removed by the administration.

      As a result, your training records associated with this account have been purged. 
      If you believe this is an error or if you intend to continue teaching, 
      please contact the Sunday School Superintendent or Church Elders immediately.

      Regards,
      GBC Administration
      ------------------------------------------------------
    `;

    console.group('MOCK ACCOUNT DELETION EMAIL');
    console.log('TO:', user.email);
    console.log('SUBJECT:', `GBC Portal: Account Access Revoked - ${user.name}`);
    console.log('BODY:', emailBody);
    console.groupEnd();

    return true;
  }
};
