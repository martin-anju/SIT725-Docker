/**
 * @jest-environment jsdom
 */

const { handleFileUpload } = require("../upload.js");

describe("handleFileUpload", () => {
  let form, fileInput, uploadStatus, extractedTextArea, getFeedbackBtn;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="resumeForm">
        <input type="file" id="resumeFile" />
        <div id="uploadStatus"></div>
        <textarea id="extractedText"></textarea>
        <button id="getFeedbackBtn" class="d-none"></button>
      </form>
    `;

    form = document.getElementById("resumeForm");
    fileInput = document.getElementById("resumeFile");
    uploadStatus = document.getElementById("uploadStatus");
    extractedTextArea = document.getElementById("extractedText");
    getFeedbackBtn = document.getElementById("getFeedbackBtn");

    handleFileUpload();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should display an error if no file is selected", () => {
    form.dispatchEvent(new Event("submit"));
    expect(uploadStatus.innerHTML).toBe(
      '<span class="text-danger">No file selected!</span>'
    );
  });

  test("should upload the file and display success message", async () => {
    // Mock the file input
    const mockFile = new File(["dummy content"], "resume.pdf", {
      type: "application/pdf",
    });

    // Mock the FileList object
    const mockFileList = {
      0: mockFile,
      length: 1,
      item: (index) => mockFile,
    };

    Object.defineProperty(fileInput, "files", {
      value: mockFileList,
    });

    // Mock the fetch API for a successful upload
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            extractedText: "Sample extracted text",
          }),
      })
    );

    // Simulate form submission
    form.dispatchEvent(new Event("submit"));

    // Wait for the async code to complete
    await new Promise(process.nextTick);

    // Check that the success message is displayed
    expect(uploadStatus.innerHTML).toBe(
      '<span class="text-success">File uploaded successfully!</span>'
    );

    // Check that the extracted text area is updated
    expect(extractedTextArea.value).toBe("Sample extracted text");

    // Check that the feedback button is shown
    expect(getFeedbackBtn.classList.contains("d-none")).toBe(false);
  });

  test("should display an error message if the upload fails", async () => {
    // Mock the file input
    const mockFile = new File(["dummy content"], "resume.pdf", {
      type: "application/pdf",
    });

    // Mock the FileList object
    const mockFileList = {
      0: mockFile,
      length: 1,
      item: (index) => mockFile,
    };

    Object.defineProperty(fileInput, "files", {
      value: mockFileList,
    });

    // Mock the fetch API for a failed upload
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            message: "Upload failed",
          }),
      })
    );

    // Simulate form submission
    form.dispatchEvent(new Event("submit"));

    // Wait for the async code to complete
    await new Promise(process.nextTick);

    // Check that the error message is displayed
    expect(uploadStatus.innerHTML).toBe(
      '<span class="text-danger">Error: Upload failed</span>'
    );
  });
});
