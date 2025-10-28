import type { PromptOptions } from "./base";

export function multiselect(
  options: PromptOptions & { choices: string[] },
): Promise<string[]> {
  return new Promise((resolve) => {
    // ตัวอย่างการทำงานพื้นฐาน
    // ในทางปฏิบัติควรมี UI สำหรับรับ input
    console.log(`${options.message}`);
    options.choices.forEach((choice, index) => {
      console.log(`${index + 1}. ${choice}`);
    });
    resolve([]); // คืนค่า array ว่างเป็นค่าเริ่มต้น
  });
}
