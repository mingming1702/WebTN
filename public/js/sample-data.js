export const SAMPLE_EXAMS = [
  {
    id: 'exam_tv_mau_01',
    title: 'Đề ôn tập Tiếng Việt tổng hợp – Đề số 01',
    description:
      'Gồm 20 câu hỏi đơn về chính tả, từ vựng, ngữ pháp, biện pháp tu từ và 2 đoạn đọc hiểu (Câu 21–25, Câu 26–30).',
    durationMinutes: 40,
    isPublished: true,
    createdAt: '2026-11-19T08:00:00.000Z',
    updatedAt: '2026-11-19T08:00:00.000Z',
    singleQuestions: [
      {
        number: 1,
        question: 'Dòng nào dưới đây viết đúng chính tả tất cả các từ?',
        options: {
          A: 'Sáng sủa, chia sẻ, xuất sắc, trau chuốt',
          B: 'Sáng sủa, chia xẻ, suất sắc, trau chuốt',
          C: 'Xáng sủa, chia sẻ, xuất sắc, chau chuốt',
          D: 'Sáng sủa, chia sẻ, xuất xắc, trau chuốt'
        },
        correctAnswer: 'A',
        explanation: 'Viết đúng là: sáng sủa, chia sẻ, xuất sắc, trau chuốt.'
      },
      {
        number: 2,
        question: 'Từ nào dưới đây là từ láy?',
        options: {
          A: 'Sách vở',
          B: 'Lung linh',
          C: 'Quần áo',
          D: 'Bàn ghế'
        },
        correctAnswer: 'B',
        explanation: '"Lung linh" là từ láy âm đầu l-. Các từ còn lại là từ ghép.'
      },
      {
        number: 3,
        question: 'Từ "đi" trong câu nào dưới đây được dùng theo nghĩa gốc?',
        options: {
          A: 'Đôi giày này đi rất êm chân.',
          B: 'Tàu hỏa đang đi vào sân ga.',
          C: 'Em bé đang tập đi từng bước nhỏ.',
          D: 'Cầu thủ số 10 đi bóng khéo léo.'
        },
        correctAnswer: 'C',
        explanation: 'Nghĩa gốc của "đi" là hoạt động tự di chuyển bằng hai chân của người hoặc động vật.'
      },
      {
        number: 4,
        question: 'Câu văn: "Những cánh đồng lúa chín vàng ươm như tấm thảm lụa khổng lồ." sử dụng biện pháp tu từ nào?',
        options: {
          A: 'Nhân hóa',
          B: 'Ẩn dụ',
          C: 'So sánh',
          D: 'Hoán dụ'
        },
        correctAnswer: 'C',
        explanation: 'Có từ so sánh "như" đối chiếu "những cánh đồng lúa chín vàng ươm" với "tấm thảm lụa khổng lồ".'
      },
      {
        number: 5,
        question: 'Từ nào đồng nghĩa với từ "siêng năng"?',
        options: {
          A: 'Lười biếng',
          B: 'Chăm chỉ',
          C: 'Cẩu thả',
          D: 'Nóng nảy'
        },
        correctAnswer: 'B',
        explanation: '"Chăm chỉ" và "siêng năng" cùng chỉ đức tính cần cù, chịu khó.'
      },
      {
        number: 6,
        question: 'Thành ngữ "Uống nước nhớ nguồn" khuyên chúng ta điều gì?',
        options: {
          A: 'Phải biết tiết kiệm nước sạch trong sinh hoạt',
          B: 'Phải biết ơn những người đã tạo dựng, giúp đỡ mình',
          C: 'Phải tìm hiểu nguồn gốc các dòng sông lớn',
          D: 'Phải rèn luyện sức khỏe mỗi ngày'
        },
        correctAnswer: 'B',
        explanation: 'Thành ngữ ca ngợi lòng biết ơn tổ tiên, thầy cô và những người đi trước.'
      },
      {
        number: 7,
        question: 'Trong câu "Mùa xuân, cây cối đâm chồi nảy lộc.", bộ phận nào là chủ ngữ?',
        options: {
          A: 'Mùa xuân',
          B: 'Cây cối',
          C: 'Đâm chồi nảy lộc',
          D: 'Mùa xuân, cây cối'
        },
        correctAnswer: 'B',
        explanation: '"Mùa xuân" là trạng ngữ chỉ thời gian; "cây cối" là chủ ngữ; "đâm chồi nảy lộc" là vị ngữ.'
      },
      {
        number: 8,
        question: 'Dòng nào chỉ gồm các danh từ?',
        options: {
          A: 'Học sinh, quyển vở, dòng sông, ngôi trường',
          B: 'Chạy nhảy, quyển vở, xinh đẹp, ngôi trường',
          C: 'Dòng sông, xanh biếc, học sinh, lắng nghe',
          D: 'Ngôi trường, dịu dàng, ánh nắng, đọc sách'
        },
        correctAnswer: 'A',
        explanation: 'Học sinh, quyển vở, dòng sông, ngôi trường đều là danh từ chỉ người và sự vật.'
      },
      {
        number: 9,
        question: 'Từ "bình minh" trái nghĩa với từ nào sau đây?',
        options: {
          A: 'Rạng đông',
          B: 'Buổi sáng',
          C: 'Hoàng hôn',
          D: 'Ban trưa'
        },
        correctAnswer: 'C',
        explanation: 'Bình minh là lúc mặt trời mọc, trái nghĩa với hoàng hôn là lúc mặt trời lặn.'
      },
      {
        number: 10,
        question: 'Câu nào dưới đây là câu hỏi (nghi vấn) dùng với mục đích cầu khiến lịch sự?',
        options: {
          A: 'Hôm nay trời có nắng không?',
          B: 'Bạn có thể mở giúp mình ô cửa sổ được không?',
          C: 'Ai là người vẽ bức tranh này thế?',
          D: 'Mấy giờ thì tiết học bắt đầu?'
        },
        correctAnswer: 'B',
        explanation: 'Câu B dùng hình thức câu hỏi để đề nghị, nhờ vả một cách lịch sự.'
      },
      {
        number: 11,
        question: 'Cách viết hoa nào dưới đây là đúng quy tắc chính tả tiếng Việt?',
        options: {
          A: 'Thành phố Hồ Chí Minh',
          B: 'Thành Phố hồ chí minh',
          C: 'thành phố Hồ chí minh',
          D: 'Thành phố hồ Chí Minh'
        },
        correctAnswer: 'A',
        explanation: 'Viết hoa chữ cái đầu của danh từ chung đứng đầu tên đơn vị hành chính và viết hoa tất cả các âm tiết tên riêng.'
      },
      {
        number: 12,
        question: 'Hai câu sau liên kết với nhau bằng phép liên kết nào?\n"Lan rất thích đọc sách. Em thường dành một giờ mỗi tối để đọc truyện."',
        options: {
          A: 'Phép nối',
          B: 'Phép thế',
          C: 'Phép lặp từ ngữ',
          D: 'Phép trái nghĩa'
        },
        correctAnswer: 'B',
        explanation: 'Đại từ "Em" ở câu sau dùng để thay thế cho danh từ riêng "Lan" ở câu trước.'
      },
      {
        number: 13,
        question: 'Trong các từ sau, từ nào viết sai chính tả?',
        options: {
          A: 'Giành giật',
          B: 'Để dành',
          C: 'Tranh giành',
          D: 'Dành giật'
        },
        correctAnswer: 'D',
        explanation: 'Đúng chính tả là "giành giật" (nghĩa là cố lấy về mình).'
      },
      {
        number: 14,
        question: 'Cặp quan hệ từ "Tuy ... nhưng ..." biểu thị quan hệ gì giữa các vế câu?',
        options: {
          A: 'Nguyên nhân – kết quả',
          B: 'Điều kiện – kết quả',
          C: 'Tương phản',
          D: 'Tăng tiến'
        },
        correctAnswer: 'C',
        explanation: 'Cặp quan hệ từ "Tuy ... nhưng ..." biểu thị mối quan hệ tương phản giữa hai vế câu.'
      },
      {
        number: 15,
        question: 'Từ "xuân" trong câu thơ "Mùa xuân là Tết trồng cây / Làm cho đất nước càng ngày càng xuân" có hiện tượng gì?',
        options: {
          A: 'Từ đồng âm',
          B: 'Từ nhiều nghĩa (chuyển nghĩa)',
          C: 'Từ trái nghĩa',
          D: 'Từ mượn'
        },
        correctAnswer: 'B',
        explanation: '"Xuân" (1) chỉ mùa đầu tiên trong năm; "xuân" (2) mang nghĩa chuyển chỉ sự tươi trẻ, đầy sức sống.'
      },
      {
        number: 16,
        question: 'Dấu ngoặc kép trong câu: "Cô giáo khen: \'Bài viết của em hôm nay rất giàu cảm xúc!\'" dùng để làm gì?',
        options: {
          A: 'Đánh dấu phần giải thích',
          B: 'Dẫn lời nói trực tiếp của nhân vật',
          C: 'Ngăn cách các bộ phận cùng chức vụ',
          D: 'Đánh dấu câu cảm thán'
        },
        correctAnswer: 'B',
        explanation: 'Dấu ngoặc kép/nháy đơn sau dấu hai chấm ở đây dùng để dẫn trực tiếp lời khen của cô giáo.'
      },
      {
        number: 17,
        question: 'Từ nào dưới đây có tiếng "hữu" mang nghĩa là "bạn bè"?',
        options: {
          A: 'Hữu ích',
          B: 'Chiến hữu',
          C: 'Hữu hạn',
          D: 'Sở hữu'
        },
        correctAnswer: 'B',
        explanation: '"Chiến hữu" là bạn cùng chiến đấu; còn hữu ích/hữu hạn (có), sở hữu (nắm giữ).'
      },
      {
        number: 18,
        question: 'Câu nào dưới đây là câu ghép?',
        options: {
          A: 'Trên cành cao, những chú chim sơn ca đang hót líu lo.',
          B: 'Buổi sáng, sương mù giăng kín mặt hồ và phủ mờ lối đi.',
          C: 'Trời vừa hửng sáng, mẹ đã ra đồng gặt lúa.',
          D: 'Em và các bạn cùng nhau dọn vệ sinh sân trường.'
        },
        correctAnswer: 'C',
        explanation: 'Câu C có 2 cụm chủ-vị không bao chứa nhau: (1) Trời / vừa hửng sáng; (2) mẹ / đã ra đồng gặt lúa.'
      },
      {
        number: 19,
        question: 'Biện pháp nhân hóa được thể hiện rõ nhất ở câu nào sau đây?',
        options: {
          A: 'Mặt trời đỏ rực như một quả cầu lửa.',
          B: 'Bác giun đất cần mẫn cày xới từng tấc đất tơi xốp.',
          C: 'Dòng sông uốn lượn quanh co giữa cánh đồng xanh.',
          D: 'Tiếng suối chảy róc rách qua khe đá.'
        },
        correctAnswer: 'B',
        explanation: 'Gọi giun đất là "bác" và gán hành động "cần mẫn" của con người là biện pháp nhân hóa.'
      },
      {
        number: 20,
        question: 'Câu tục ngữ nào nói về tinh thần đoàn kết?',
        options: {
          A: 'Có công mài sắt, có ngày nên kim.',
          B: 'Một cây làm chẳng nên non, ba cây chụm lại nên hòn núi cao.',
          C: 'Đi một ngày đàng, học một sàng khôn.',
          D: 'Đói cho sạch, rách cho thơm.'
        },
        correctAnswer: 'B',
        explanation: 'Câu tục ngữ khẳng định sức mạnh của sự gắn bó, đoàn kết tập thể.'
      }
    ],
    groups: [
      {
        id: 'group_1',
        title: 'Nhóm đọc hiểu 1 (Câu 21 – 25)',
        passageTitle: 'Buổi sớm trên đồi chè',
        passage:
          'Mỗi buổi sớm mai, khi màn sương mỏng còn bảng lảng trên triền đồi, cả không gian như chìm trong vẻ tĩnh lặng dịu êm. Từ phía đông, những tia nắng đầu tiên nhẹ nhàng xuyên qua kẽ lá, đánh thức từng búp chè non còn ngậm đầy sương sớm. Gió núi thổi qua mang theo hương chè thanh mát, quyện với mùi đất ẩm sau đêm dài.\n\nTrên con đường nhỏ uốn quanh sườn đồi, tiếng cười nói rộn ràng của các cô bác nông dân bắt đầu vang lên. Đôi bàn tay thoăn thoắt hái từng búp chè xanh mướt bỏ vào chiếc gùi sau lưng. Nắng lên cao dần, cả đồi chè bừng sáng như một bức tranh xanh biếc đầy sức sống, báo hiệu một ngày lao động mới bình yên và no ấm.',
        questions: [
          {
            number: 21,
            question: 'Đoạn văn trên miêu tả khung cảnh nào?',
            options: {
              A: 'Cảnh hoàng hôn trên biển',
              B: 'Cảnh buổi sớm trên đồi chè',
              C: 'Cảnh phiên chợ vùng cao ngày Tết',
              D: 'Cảnh cơn mưa rào mùa hạ'
            },
            correctAnswer: 'B',
            explanation: 'Toàn bộ đoạn văn tập trung tả cảnh thiên nhiên và con người vào buổi sớm trên đồi chè.'
          },
          {
            number: 22,
            question: 'Trong đoạn đầu, chi tiết nào cho thấy buổi sớm vẫn còn rất sớm và yên ả?',
            options: {
              A: 'Tiếng xe cộ chạy rộn ràng dưới thung lũng',
              B: 'Màn sương mỏng bảng lảng và không gian tĩnh lặng dịu êm',
              C: 'Ánh nắng gay gắt chiếu xuống mặt đất',
              D: 'Những đám mây đen kéo đến kín bầu trời'
            },
            correctAnswer: 'B',
            explanation: 'Câu mở đầu nêu rõ: "khi màn sương mỏng còn bảng lảng... cả không gian như chìm trong vẻ tĩnh lặng dịu êm".'
          },
          {
            number: 23,
            question: 'Cụm từ "đánh thức từng búp chè non" sử dụng biện pháp nghệ thuật gì?',
            options: {
              A: 'Nhân hóa',
              B: 'Nói quá',
              C: 'Điệp ngữ',
              D: 'Liệt kê'
            },
            correctAnswer: 'A',
            explanation: 'Tác giả dùng hành động của con người ("đánh thức") cho tia nắng và búp chè non.'
          },
          {
            number: 24,
            question: 'Hình ảnh người nông dân trong đoạn văn hiện lên với nét đẹp nào?',
            options: {
              A: 'Buồn bã, mệt mỏi trước công việc',
              B: 'Vui vẻ, chăm chỉ và nhanh nhẹn trong lao động',
              C: 'Vội vã tránh cơn bão lớn sắp tới',
              D: 'Đang nghỉ ngơi sau khi thu hoạch xong'
            },
            correctAnswer: 'B',
            explanation: 'Thể hiện qua chi tiết "tiếng cười nói rộn ràng", "đôi bàn tay thoăn thoắt hái từng búp chè".'
          },
          {
            number: 25,
            question: 'Từ "thanh mát" trong đoạn văn gợi cảm giác gì cho người đọc?',
            options: {
              A: 'Nặng nề, oi bức',
              B: 'Trong lành, dễ chịu và tươi mới',
              C: 'Lạnh buốt, giá rét',
              D: 'Nồng nặc, khó chịu'
            },
            correctAnswer: 'B',
            explanation: '"Hương chè thanh mát" gợi mùi thơm nhẹ nhàng, trong lành của thiên nhiên buổi sáng.'
          }
        ]
      },
      {
        id: 'group_2',
        title: 'Nhóm đọc hiểu 2 (Câu 26 – 30)',
        passageTitle: 'Sức mạnh của thói quen đọc sách',
        passage:
          'Trong nhịp sống hiện đại với nhiều thiết bị điện tử hấp dẫn, việc duy trì thói quen đọc sách giấy hoặc sách nói mỗi ngày mang lại giá trị vô cùng bền vững. Chỉ cần dành ra hai mươi phút trước khi đi ngủ để đọc vài trang sách, tâm trí chúng ta sẽ dần lắng lại, giảm bớt căng thẳng sau một ngày học tập và làm việc.\n\nKhông chỉ mở rộng vốn hiểu biết về thế giới xung quanh, đọc sách còn giúp người đọc rèn luyện khả năng tập trung, làm giàu vốn từ ngữ và nuôi dưỡng lòng đồng cảm. Mỗi cuốn sách hay giống như một người thầy thầm lặng, kiên nhẫn đồng hành cùng ta trên hành trình trưởng thành.',
        questions: [
          {
            number: 26,
            question: 'Theo đoạn văn, dành khoảng bao nhiêu thời gian mỗi ngày để đọc sách trước khi ngủ đã mang lại hiệu quả tích cực?',
            options: {
              A: '5 phút',
              B: '20 phút',
              C: '2 giờ',
              D: 'Cả buổi tối'
            },
            correctAnswer: 'B',
            explanation: 'Đoạn văn viết: "Chỉ cần dành ra hai mươi phút trước khi đi ngủ để đọc vài trang sách...".'
          },
          {
            number: 27,
            question: 'Lợi ích nào KHÔNG được nhắc đến trong văn bản trên?',
            options: {
              A: 'Giúp giảm bớt căng thẳng',
              B: 'Rèn luyện khả năng tập trung',
              C: 'Làm giàu vốn từ ngữ và lòng đồng cảm',
              D: 'Giúp tăng chiều cao nhanh chóng'
            },
            correctAnswer: 'D',
            explanation: 'Các phương án A, B, C đều được nêu trực tiếp trong bài; D không có trong văn bản.'
          },
          {
            number: 28,
            question: 'Tác giả đã ví mỗi cuốn sách hay như hình ảnh nào?',
            options: {
              A: 'Một ngọn hải đăng giữa biển khơi',
              B: 'Một người thầy thầm lặng',
              C: 'Một cánh cửa bằng vàng',
              D: 'Một dòng sông hiền hòa'
            },
            correctAnswer: 'B',
            explanation: 'Câu cuối viết: "Mỗi cuốn sách hay giống như một người thầy thầm lặng...".'
          },
          {
            number: 29,
            question: 'Từ "bền vững" trong đoạn văn có nghĩa gần nhất với từ nào?',
            options: {
              A: 'Tạm thời',
              B: 'Lâu dài, vững chắc',
              C: 'Nhanh chóng',
              D: 'Nhỏ bé'
            },
            correctAnswer: 'B',
            explanation: '"Bền vững" chỉ giá trị tồn tại lâu dài và chắc chắn theo thời gian.'
          },
          {
            number: 30,
            question: 'Thông điệp chính mà tác giả muốn gửi gắm qua đoạn văn là gì?',
            options: {
              A: 'Nên ngừng sử dụng hoàn toàn các thiết bị điện tử',
              B: 'Chỉ nên đọc sách vào dịp nghỉ hè',
              C: 'Hãy duy trì thói quen đọc sách mỗi ngày để hoàn thiện bản thân',
              D: 'Sách nói tốt hơn sách giấy rất nhiều'
            },
            correctAnswer: 'C',
            explanation: 'Đoạn văn khuyến khích duy trì thói quen đọc sách hằng ngày nhờ nhiều lợi ích về tinh thần và tri thức.'
          }
        ]
      }
    ]
  }
];
