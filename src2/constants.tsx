
import { Question } from './types';

export const COLORS = {
  primary: '#2E5D4E', // Deep Green
  secondary: '#E54B4B', // Watermelon Red
  accent: '#7DBDBA', // Teal
  light: '#F8FAFC',
  dark: '#1E293B'
};

export const QUESTION_POOL: Question[] = [
  {
    id: 1,
    text: "According to the policy, what is the legal definition of a 'Child'?",
    options: ["A person under 16 years of age", "Any person enrolled in Sunday School", "A person under 18 years of age", "Anyone who likes cartoons"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "As per section 1.2, a child is defined as a person under 18 years of age."
  },
  /* 
  {
    id: 2,
    text: "Who is the currently listed Sunday School Superintendent in the policy?",
    options: ["Shane Mayer", "The Church Elders", "The Child Protection Officer", "The Local Police Chief"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Section 1.1 lists Shane Mayer as the Sunday School Superintendent (0696919643)."
  },
  */
  {
    id: 3,
    text: "Which Act does this policy ensure legal compliance with?",
    options: ["The Church Safety Act of 1990", "The Baptist Union Guidelines", "The International Superhero Defense Code", "Section 110 of the Children's Act 38 of 2005"],
    correctIndex: 3,
    falseIndex: 2,
    explanation: "The document's purpose is to ensure legal compliance with Section 110 of the Children's Act 38 of 2005."
  },
  {
    id: 4,
    text: "What is the 'two adults' rule regarding interaction in a room?",
    options: ["Children must always be in groups of two", "There must be more than one leader with a child in a room", "Elders must check rooms every 2 hours", "Two leaders must share one chair"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Section 3.1.7 states: 'There must be more than one leader with a child in a room.'"
  },
  {
    id: 5,
    text: "What should a leader do if they find themselves alone with a child?",
    options: ["Ask another leader to accompany them immediately", "Immediately leave the child alone", "Finish the activity quickly", "Hide in a cupboard until help arrives"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "If alone, another leader should be asked to accompany them immediately (3.1.7)."
  },
  {
    id: 6,
    text: "Where should sensitive conversations with children take place?",
    options: ["In a locked office for total privacy", "In the main sanctuary during service", "In a quiet spot that is easily accessible and not behind locked doors", "In a soundproof underground bunker"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "Conversations should be in a quiet spot but never happen behind locked doors (3.1.8)."
  },
  {
    id: 7,
    text: "Under what condition can a leader hug a child?",
    options: ["Only if the child initiates the contact and it's side-to-side", "Anytime the leader feels like it", "Hugging is strictly forbidden in all cases", "Only if the child is wearing a heavy winter coat"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Section 3.4.1: 'Hugging can only be done if the child initiates the contact... use a side-to-side hug.'"
  },
  {
    id: 8,
    text: "Lap sitting is only appropriate for which age group?",
    options: ["Children under ten", "Anyone who is feeling sad", "Only for children who weigh less than 5kg", "Children under five"],
    correctIndex: 3,
    falseIndex: 2,
    explanation: "Section 3.4.4: 'Lap sitting is only appropriate for children under five.'"
  },
  {
    id: 9,
    text: "Holding children for comfort is only appropriate for which Grade?",
    options: ["Grade 3 or below", "Grade R or below", "Grade 7 or below", "Only for children who can recite the alphabet backwards"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Section 3.4.5: 'Holding children is only appropriate for children in or below Grade R.'"
  },
  {
    id: 10,
    text: "How often does someone need to be re-certified to continue working with children?",
    options: ["Every year", "Every two years", "Every fifth year", "Once every millennium"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Training and re-certification must be completed every two years to ensure all staff remain current with the latest child protection protocols."
  },
  {
    id: 11,
    text: "Which of these is listed as a forbidden disciplinary strategy?",
    options: ["Re-direction", "Use of rewards and encouragement", "Using corporal punishment (spanking/hitting)", "Making the child stand on one leg for 4 hours"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "Corporal punishment is strictly forbidden as per section 3.3.3.g."
  },
  {
    id: 12,
    text: "Who must give written permission for photos to be taken of a child?",
    options: ["The Parent or Guardian", "The Sunday School teacher", "The Church Secretary", "A professional photographer from the local newspaper"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Section 3.6.2.a: 'The parent/guardian of the child must give written permission for photos to be taken.'"
  },
  {
    id: 13,
    text: "What is the gather point in case of a fire?",
    options: ["Inside the sanctuary", "The kitchen", "The nearest ice cream shop", "The parking lot"],
    correctIndex: 3,
    falseIndex: 2,
    explanation: "Section 3.9.2: 'Gather in the parking lot of the church' in case of fire."
  },
  {
    id: 14,
    text: "What is the rule for Grades 1-7 using the bathroom?",
    options: ["The leader must accompany them inside", "The care provider should wait outside the bathroom door", "They must use the bathroom in pairs", "They must signal their return using a smoke machine"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Section 3.12.4: For Grades 1-7, the provider should wait outside the bathroom door."
  },
  {
    id: 15,
    text: "If you suspect abuse, what is the first step?",
    options: ["Call the parents immediately", "Inform the ministry leader immediately", "Investigate the child yourself", "Post about it on social media"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Section 2.4.2.a.i: 'Inform the ministry leader immediately whenever you see signs or suspect abuse.'"
  },
  {
    id: 16,
    text: "Which legislation governs the processing of personal information?",
    options: ["The Church Privacy Act", "The South African Secret Service Act", "POPIA", "The Book of Records"],
    correctIndex: 2,
    falseIndex: 1,
    explanation: "Section 1.4.6: 'Protection of Personal Information Act (POPIA).'"
  },
  {
    id: 17,
    text: "Are leaders allowed to administer non-prescription over-the-counter medicine?",
    options: ["Yes, for simple headaches", "Only with the Superintendent's verbal permission", "No, no medication without a prescription may be administered", "Only if the medicine tastes like strawberries"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "Section 3.8.3.1: 'No medication that does not have a prescription may be administered to any child.'"
  },
  {
    id: 18,
    text: "What happens to a church employee found guilty of child abuse?",
    options: ["They are permanently removed from their position of working with children", "They receive a verbal warning", "They are transferred to the youth ministry", "They are forced to eat only brussels sprouts for a month"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Section 2.4.c.vi: 'Any person who is found guilty... will be removed from their position of working with children.'"
  },
  {
    id: 19,
    text: "Is tickling allowed as a form of play?",
    options: ["Yes, if the child likes it", "Only if other leaders are watching", "No, tickling or prolonged physical contact of any kind is not appropriate", "Only if the leader is wearing feathers"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "Section 3.4.2: 'Tickling or prolonged physical contact of any kind is not appropriate.'"
  },
  {
    id: 20,
    text: "What is required before transporting children in church vehicles?",
    options: ["The driver must be an Elder", "The vehicle must be painted green", "Necessary documentation like indemnity and consent forms must be completed", "The driver must know the lyrics to every hymn"],
    correctIndex: 2,
    falseIndex: 1,
    explanation: "Section 3.10.6: 'Children may only be transported when the necessary documentation has been completed, e.g., an indemnity and consent form.'"
  },
  {
    id: 21,
    text: "What is the policy regarding sending private messages (DM/WhatsApp) to a child?",
    options: ["It's fine if it's about Sunday School", "Leaders should not private message children; communications should include a parent or another leader", "Only on birthdays", "Only if you use a lot of emojis"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Communication boundaries require transparency, typically including parents or groups to avoid private, unmonitored access."
  },
  {
    id: 22,
    text: "Which of these is a sign of potential neglect as defined by the policy context?",
    options: ["Consistent poor hygiene or inappropriate clothing for the weather", "The child is energetic", "The child likes to sing loudly", "The child wears mismatched socks on purpose"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Consistent poor hygiene and lack of weather-appropriate clothing are standard indicators of neglect in child protection training."
  },
  {
    id: 23,
    text: "What should you do if a child discloses abuse to you?",
    options: ["Ask them to repeat it for a recording", "Tell them to stop talking immediately", "Run to find a camera", "Listen, stay calm, reassure them it's not their fault, and do not promise total secrecy"],
    correctIndex: 3,
    falseIndex: 2,
    explanation: "Best practice is to listen and reassure, but explain that you must tell someone who can help (no secrets)."
  },
  {
    id: 24,
    text: "When reporting abuse to the authorities, which form is typically required under the Children's Act?",
    options: ["Annexure A", "Form 22", "Report Card 1", "Permission Slip B"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Form 22 is the standard form for reporting suspected child abuse to the Department of Social Development or Police in South Africa."
  },
  {
    id: 25,
    text: "How should first aid incidents be recorded?",
    options: ["In a personal diary", "By memory only", "In an official Incident/Accident Log Book with date, time, and details", "By writing on a napkin"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "All injuries, even minor ones, must be documented in an official log for legal and safety reasons."
  },
  {
    id: 26,
    text: "Can a volunteer who has not yet completed their screening work with children?",
    options: ["Yes, if they look trustworthy", "No, all staff and volunteers must be screened before commencing work with children", "Only if it's a very busy day", "Only if they bring snacks"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Screening (including police clearance and interview) is a mandatory prerequisite for all child-facing roles."
  },
  {
    id: 27,
    text: "What is the policy on giving individual personal gifts to a specific child?",
    options: ["Encouraged to build rapport", "Gifts should be given to the group or through the ministry leader/parents to avoid grooming concerns", "Only if the gift costs more than R500", "Only if the gift is wrapped in gold"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Individual gift-giving can be misinterpreted or used for grooming; transparency through the ministry or parents is required."
  },
  {
    id: 28,
    text: "What must be checked during the recruitment of a new children's ministry volunteer?",
    options: ["Minimum of two references and checking against the National Child Protection Register", "Their favorite movie", "How many hymns they know", "Their ability to bake cookies"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Section 4.1.3 emphasizes the importance of reference checks and Register verification."
  },
  {
    id: 29,
    text: "What is the 'Rule of Three' in some church safety contexts?",
    options: ["Never have fewer than three children in a group", "Children must pray three times", "Never be alone with a child; always ensure a total of at least three people (e.g., 2 adults 1 child)", "Leaders must wear three layers of clothing"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "The 'Rule of Three' ensures no adult is ever alone with a child, maintaining safety for both parties."
  },
  {
    id: 30,
    text: "Is smoking or alcohol consumption allowed while on duty with children?",
    options: ["Only during breaks", "Only if the parents are present", "Only on festive holidays", "Strictly prohibited at all times while responsible for children"],
    correctIndex: 3,
    falseIndex: 2,
    explanation: "Substance use is strictly prohibited to ensure full capacity for supervision and appropriate role modeling."
  },
  {
    id: 31,
    text: "How long should child protection records (like consent forms) be kept according to generic church guidelines/POPIA?",
    options: ["1 month", "Indefinitely or as per legal requirement (usually minimum 3-5 years after the child turns 18)", "Until the end of the year", "They should be burned immediately"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Legal records regarding children must often be kept for extended periods to account for delayed disclosures."
  },
  {
    id: 32,
    text: "If you observe a fellow leader behaving inappropriately, what should you do?",
    options: ["Report it immediately to the Ministry Leader or CPO as per the Whistleblowing policy", "Ignore it to avoid conflict", "Tell the children to run away", "Start a rumor about them"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "The policy requires immediate reporting of any concerns, even regarding colleagues, to protect the children."
  },
  {
    id: 33,
    text: "What is the primary goal of the Child Protection Policy?",
    options: ["To make more work for volunteers", "To increase church membership", "To create a safe and secure environment for children to grow and learn", "To win a safety award"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "The primary focus is always the safety, well-being, and protection of the children in the church's care."
  },
  {
    id: 34,
    text: "When should a register of attendance be taken for Sunday School?",
    options: ["Only on special occasions", "Once a month", "Only if the kids are being noisy", "Every single time the group meets"],
    correctIndex: 3,
    falseIndex: 2,
    explanation: "Accurate attendance records are vital for safety, emergency evacuations, and accountability."
  },
  {
    id: 35,
    text: "What is defined as 'Physical Abuse' in the context of the policy?",
    options: ["Giving a high-five", "Any non-accidental physical injury to a child", "Asking a child to sit down", "Helping a child tie their shoes"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Physical abuse involves non-accidental harm, including hitting, shaking, or burning."
  },
  {
    id: 36,
    text: "Can a leader take a child home in their private car without prior consent?",
    options: ["No, transport requires written consent and adherence to church vehicle policies", "Yes, if it's raining", "Yes, if the child asks", "Only if the car is a taxi"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Transporting children privately is high-risk and requires strict adherence to consent and safety protocols."
  },
  {
    id: 37,
    text: "What is the 'CPO'?",
    options: ["Church Pizza Organizer", "Chief Prayer Official", "Captain of Public Outreach", "Child Protection Officer"],
    correctIndex: 3,
    falseIndex: 2,
    explanation: "The Child Protection Officer is the designated person responsible for overseeing the safety policy."
  },
  {
    id: 38,
    text: "Which grade levels are allowed to go to the bathroom unaccompanied but with a leader outside?",
    options: ["Grades 1 to 7", "Nursery", "Adults only", "Children under two"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "As per section 3.12.4, for Grades 1-7, the provider waits outside the door."
  },
  {
    id: 39,
    text: "Who has the final responsibility for the implementation of this policy?",
    options: ["The children", "The Church Elders", "The local council", "The neighbors"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "The Church Leadership (Elders/Board) holds ultimate accountability for the safety of the church environment."
  },
  {
    id: 40,
    text: "Is emotional abuse (like consistent belittling) covered by this policy?",
    options: ["No, only physical marks count", "Only if the child cries", "Yes, emotional abuse is a recognized form of harm and must be reported", "Only on Sundays"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "The policy covers all forms of abuse, including physical, sexual, emotional, and neglect."
  },
  {
    id: 41,
    text: "What is the policy regarding tagging children in church photos on social media?",
    options: ["It is encouraged for reach", "Do not tag children in photos or post identifiable personal information without specific parent consent", "Only on the church's private page", "Only if the child is smiling"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "To ensure privacy and safety, tagging children or providing full names on social media platforms is prohibited."
  },
  {
    id: 42,
    text: "Where is the parent/guardian emergency contact information typically kept?",
    options: ["In the main church safe", "It is not collected", "In a secure, accessible location known to all leaders", "On the teacher's personal phone"],
    correctIndex: 2,
    falseIndex: 1,
    explanation: "Emergency info must be immediately accessible to leaders in case of an incident, typically kept with the attendance records."
  },
  {
    id: 43,
    text: "How quickly must a suspicion of child abuse be reported to the ministry leader?",
    options: ["Immediately", "Within 48 hours", "At the end of the school term", "Only after you have proof"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Suspected abuse must be reported immediately to ensure the child's safety and comply with mandatory reporting laws."
  },
  {
    id: 44,
    text: "If a parent makes a complaint about a leader's conduct, who handles it?",
    options: ["The leader involved", "The CPO or Church Leadership (Elders)", "It is ignored", "The local newspaper"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Formal complaints are handled by designated safety officers or church leadership to ensure impartiality."
  },
  {
    id: 45,
    text: "Are leaders allowed to use their personal mobile phones to take photos of children?",
    options: ["Yes, for ease of use", "No, church-approved devices should be used, and photos must be deleted from personal storage immediately", "Only if the phone is green", "Only if they have a lot of storage space"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Using personal phones for child photography is high-risk; policy usually dictates using church equipment or strict deletion protocols."
  },
  {
    id: 46,
    text: "What is the 'Line of Sight' rule for rooms used by children?",
    options: ["Rooms should have windows or open doors to remain visible from the outside", "Rooms must be completely dark", "Leaders must wear glasses", "Children must always look at the teacher"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "Visibility prevents isolation and protects both children and leaders from false accusations."
  },
  {
    id: 47,
    text: "What is the required leader-to-child ratio for toddlers/nursery?",
    options: ["1 leader to 20 children", "Higher ratios are required for younger children (e.g. 1:5)", "No specific ratio is needed", "1 leader per 50 children"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Younger age groups require more intensive supervision and therefore lower ratios of children to adults."
  },
  {
    id: 48,
    text: "What should you do if a child arrives at Sunday School appearing ill?",
    options: ["Contact the parent/guardian to collect the child to prevent the spread of illness", "Ask them to stay and play", "Give them a generic aspirin", "Ask them to sit in the corner alone"],
    correctIndex: 0,
    falseIndex: 3,
    explanation: "To protect other children and the sick child, parents should be called to take the child home if they are unwell."
  },
  {
    id: 49,
    text: "How often should child protection refresher training be completed?",
    options: ["Once in a lifetime", "Annually", "Every 10 years", "Only if someone forgets the rules"],
    correctIndex: 1,
    falseIndex: 3,
    explanation: "Annual training ensures that policies stay fresh in leaders' minds and accounts for any legal updates."
  },
  {
    id: 50,
    text: "Where is the First Aid kit located in the Sunday School area?",
    options: ["In the pastor's car", "Behind the church organ", "In a clearly marked and accessible location known to all leaders", "It is kept secret"],
    correctIndex: 2,
    falseIndex: 3,
    explanation: "All leaders must know the location of medical supplies for immediate response to minor injuries."
  }
];
