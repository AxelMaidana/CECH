export interface Teacher {
    name: string;
    description: string;
    imageUrl: string;
  }
  
  export interface CourseData {
    endTime: string | number | readonly string[];
    startTime: string | number | readonly string[];
    pdfUrl: any;
    title: string;
    description: string;
    teachers: Teacher[];
    duration: string;
    modality: string;
    imageUrl: string;
    price: string;
    day: string;
    hours: string;
  }