import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kLocaleStorageKey = '__locale_key__';

class FFLocalizations {
  FFLocalizations(this.locale);

  final Locale locale;

  static FFLocalizations of(BuildContext context) =>
      Localizations.of<FFLocalizations>(context, FFLocalizations)!;

  static List<String> languages() => ['tr', 'en'];

  static late SharedPreferences _prefs;
  static Future initialize() async =>
      _prefs = await SharedPreferences.getInstance();
  static Future storeLocale(String locale) =>
      _prefs.setString(_kLocaleStorageKey, locale);
  static Locale? getStoredLocale() {
    final locale = _prefs.getString(_kLocaleStorageKey);
    return locale != null && locale.isNotEmpty ? createLocale(locale) : null;
  }

  String get languageCode => locale.toString();
  String? get languageShortCode =>
      _languagesWithShortCode.contains(locale.toString())
          ? '${locale.toString()}_short'
          : null;
  int get languageIndex => languages().contains(languageCode)
      ? languages().indexOf(languageCode)
      : 0;

  String getText(String key) =>
      (kTranslationsMap[key] ?? {})[locale.toString()] ?? '';

  String getVariableText({
    String? trText = '',
    String? enText = '',
  }) =>
      [trText, enText][languageIndex] ?? '';

  static const Set<String> _languagesWithShortCode = {
    'ar',
    'az',
    'ca',
    'cs',
    'da',
    'de',
    'dv',
    'en',
    'es',
    'et',
    'fi',
    'fr',
    'gr',
    'he',
    'hi',
    'hu',
    'it',
    'km',
    'ku',
    'mn',
    'ms',
    'no',
    'pt',
    'ro',
    'ru',
    'rw',
    'sv',
    'th',
    'uk',
    'vi',
  };
}

class FFLocalizationsDelegate extends LocalizationsDelegate<FFLocalizations> {
  const FFLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    final language = locale.toString();
    return FFLocalizations.languages().contains(
      language.endsWith('_')
          ? language.substring(0, language.length - 1)
          : language,
    );
  }

  @override
  Future<FFLocalizations> load(Locale locale) =>
      SynchronousFuture<FFLocalizations>(FFLocalizations(locale));

  @override
  bool shouldReload(FFLocalizationsDelegate old) => false;
}

Locale createLocale(String language) => language.contains('_')
    ? Locale.fromSubtags(
        languageCode: language.split('_').first,
        scriptCode: language.split('_').last,
      )
    : Locale(language);

final kTranslationsMap = <Map<String, Map<String, String>>>[
  // HomePage
  {
    'bg92o6zt': {
      'tr': 'Merhabalar ben',
      'en': 'Hi! My name is',
    },
    'ttx8f010': {
      'tr': 'Yavuz.',
      'en': 'Yavuz.',
    },
    '5cgdjxcq': {
      'tr': 'Projelerim',
      'en': 'My Projects',
    },
    'hycapxu8': {
      'tr': 'Bana Ulaşın',
      'en': 'Contact Me',
    },
    'wo5c0tg5': {
      'tr': 'Hakkımda',
      'en': 'About Me',
    },
    'cjtv0znp': {
      'tr': 'CV',
      'en': 'CV',
    },
    'uw17kshp': {
      'tr': 'Çevirilerim',
      'en': 'My Translations',
    },
    '1yt7wnc6': {
      'tr': 'Translate To English',
      'en': 'Translate To English',
    },
    's3hev5mf': {
      'tr': 'EN',
      'en': 'EN',
    },
    'skw8dv8v': {
      'tr': 'Türkçeye  Çevir',
      'en': 'Türkçeye  Çevir',
    },
    'aartz4p3': {
      'tr': 'TR',
      'en': 'TR',
    },
    'g06i7tjj': {
      'tr': 'Merhabalar ben',
      'en': 'Hi! My name is',
    },
    'cbh60458': {
      'tr': 'Yavuz.',
      'en': 'Yavuz.',
    },
    '4lisv3q4': {
      'tr': 'Projelerim',
      'en': 'My Projects',
    },
    'det7ffep': {
      'tr': 'Bana Ulaşın',
      'en': 'Contact Me',
    },
    'z21zqwfj': {
      'tr': 'Hakkımda',
      'en': 'About Me',
    },
    '58pqj9z5': {
      'tr': 'CV',
      'en': 'CV',
    },
    '0gpontm1': {
      'tr': 'Çevirilerim',
      'en': 'My Translations',
    },
    'j38ian55': {
      'tr': 'Translate To English',
      'en': 'Translate To English',
    },
    'nzmyv52m': {
      'tr': 'EN',
      'en': 'EN',
    },
    'yqujenjy': {
      'tr': 'Türkçeye  Çevir',
      'en': 'Türkçeye  Çevir',
    },
    'vonf5axr': {
      'tr': 'TR',
      'en': 'TR',
    },
    '2md6j0g0': {
      'tr': 'Home',
      'en': 'Home',
    },
  },
  // hakkimda
  {
    'mt2hlzom': {
      'tr': 'Hakkımda',
      'en': 'About Me',
    },
    'setyazit': {
      'tr': 'Yavuz Selimhan Kaya',
      'en': 'Yavuz Selimhan Kaya',
    },
    'cd1xhwkf': {
      'tr': 'Hakkımda',
      'en': 'About Me',
    },
    'jgps29lv': {
      'tr':
          'Ben Yavuz, eğer siteyi güncellemeyi unutmadıysam şu an 11.sınıfa gidiyorum. Bilgisayarlarla aşinalığım küçüklüğümden geliyor. Yazılım konusunda kendimi geliştirmeye Lise Hazırlıkta başladım. Önce küçük projeler ile daha sonrasında ise kendi geliştirdiğim oyun ile atıldığım maceram şu anda çok ayrı bir boyut aldı. İlgilerimin farklı yönlerde olduğunu anladım.\n\n',
      'en':
          'I\'m Yavuz, if I haven\'t forgotten to update the site, I\'m currently going to the 11th grade. My familiarity with computers comes from my childhood. I started to develop myself in software in High School Preparatory. First with small projects, and then with the game I developed myself, my adventure has now taken a very different dimension. I realised that my interests are in different directions.\n\n',
    },
    'dfs6xie4': {
      'tr': 'Flutter',
      'en': 'Flutter',
    },
    'ytgauwc5': {
      'tr':
          '9.sınıfta Tübitak projesi olarak uygulama tasarlamak için Flutter ile tanıştım. Öncelikle internetteki hazır templateler ile bir uygulama geliştirdim. Daha sonrasında Tübitak ile işim bitince uygulamayı en baştan Firestore ile oluşturmaya başladım. Daha sonrasında kendimi geliştirip birden fazla Flutter uygulamasını App Store ve Google Play\'de yayınladım. Şu anda bu görüntülediğiniz websitesi Flutter üzerinden oluşturuldu! Aynı zamanda tüm oyun yama setuplarımın tamamı da Flutter üzerinden oluşturuldu! Her geçen gün kendimi bu mavi ekibe daha da ait hissediyorum. 💙\n\n',
      'en':
          'In 9th grade, I met Flutter to design an application as a Tübitak project. First of all, I developed an application with ready-made templates on the internet. Later, when I was done with Tübitak, I started to create the application from the beginning with Firestore. Later, I improved myself and published more than one Flutter application on the App Store and Google Play. The website you are viewing right now was created on Flutter! At the same time, all of my game patch setups were created on Flutter! Every day I feel more and more belonging to this blue team 💙\n\n',
    },
    'cvf0cnw0': {
      'tr': 'Çevirmenlik',
      'en': 'Translation',
    },
    'lgyonbfu': {
      'tr':
          '2021 yılında yeni satın almış olduğum video oyununda Türkçe dil desteği olmaması sebebi ile kendimi oyun yama platforlarında buldum. Daha sonrasında ilk bana verilen görev olarak Dishonored: Death Of The Outsider projesinde Çevirmen olarak yer aldım. Bu süreçte çok zevk aldığımdan dolayı aynı şirketin yeni çıkartmış olduğu \"DEATHLOOP\" oyunun çevirisini kendim üstlendim ve bir ekip oluşturarak sıfırdan çeviri yapmaya başladık. Sonrasında Sunset Overdrive, Demon Slayer gibi daha büyük işlere giriştim. Şu anda kendi forumum ve Discordum üzerinden çalışmalara devam ediyoruz! ceviri.cidqu.net\n\n',
      'en':
          'In 2021, I found myself on game patch platforms due to the lack of Turkish language support in the video game I had just purchased. Afterwards, I took part as a Translator in the Dishonored: Death Of The Outsider project as the first task given to me. Since I enjoyed this process very much, I undertook the translation of the \"DEATHLOOP\" game, which was recently released by the same company, and we started translating from scratch by creating a team. Afterwards, I embarked on bigger works such as Sunset Overdrive, Demon Slayer. We are currently continuing to work on my own forum and Discord! ceviri.cidqu.net\n\n',
    },
    'qqj12m2q': {
      'tr': 'Reverse Engineering',
      'en': 'Reverse Engineering',
    },
    't5rpvvi1': {
      'tr':
          'Çeviri heyecanımın ilerlemesi ile beraber kendimi büyük bir problemin içerisinde buldum. Oyunların dil dosyalarını açmak, düzenlemek ve sonrasında oyun geri aktarmak çok büyük bir problemdi. Bunun için üst düzey yazılım bilgisi gerekiyordu. Zenhax ve Xentax forumlarında çoğu kişi yardım etse de artık kendimin bir yolunu bulmam gerektiğini hissetmişim. İnternetteki bit çok kaynaktan araştırmalar yaparak, Table Offset Pointer gibi temel bilgileri edindim. Daha sonrasında Lucy, h3x3r gibi anonim kullanıcılar sayesinde kendimi eğitim alanının ortasında bulmuştum. 2 Yılı aşkındır devam eden bu denemeler sayesinde artık dosyaları özellikle oyunları Reverse Engineering methodları ile açmayı düzenlemeyi öğrendim. Kendi geliştirdiğim ilk araç Plague Tale Requiem Font Aracı oldu. Daha sonrasında hem GitHub üzerinde hem de özel bir şekilde çokça araç geliştirerek öğrenimime devam ettim ve hala etmekteyim.\n\n',
      'en':
          'As my translation excitement progressed, I found myself in a big problem. Opening, editing and then transferring the language files of the games back to the game was a huge problem. High level software knowledge was required for this. Although many people helped me in Zenhax and Xentax forums, I felt that I had to find a way myself. By doing research from many sources on the internet, I acquired basic knowledge such as Table Offset Pointer. Later, thanks to anonymous users such as Lucy, h3x3r, I found myself in the middle of the education field. After more than 2 years of these experiments, I have learnt to open and edit files, especially games, with Reverse Engineering methods. The first tool I developed myself was the Plague Tale Requiem Font Tool. Afterwards, I continued my learning by developing a lot of tools both on GitHub and privately, and I am still continuing.\n\n',
    },
    'nbyw1ysk': {
      'tr': 'FRC, VRC ve TEKNOFEST',
      'en': 'FRC, VRC ve TEKNOFEST',
    },
    'ci17rimo': {
      'tr':
          '2022 Yılının Mart ayında FRC İstanbul Regional Turnuvasında katıldık, yazılım kaptanlığını üstendiğim turnuvada şampiyon olup Houston\'daki büyük finale girmeye hak kazandık! Hemen onun peşine girmiş olduğumuz VRC İstanbul turnuvasında ise Finalist olup dört farklı özel ödül ile evimize geri döndük. Aynı senenin Temmuz ayında TÜBİTAK 2204-C Kutup Araştırma Projelerinde Finale kaldık. Final Turnuvası için Giresun\'a gittik ve 3.lük alarak evimize geri döndük! Sonrasında Ağustos ayında Rize\'de TEKNOFEST İnsanlık Yararına Teknoloji Finalinde en iyi 10 projeden biri seçildik ve aynı ay içerisinde gerçekleşen Türkçe Doğal Dil İşleme yarışmasında takımımla birlikte Türkiye 9.su olduk. Bu başarıların hepsini 2022 Eylül\'de TEKNOFEST KARADENİZ\'de kutladık!\n\n',
      'en':
          'In March 2022, we participated in the FRC Istanbul Regional Tournament, where I was the software captain, we became the champion and qualified for the grand final in Houston! In the VRC Istanbul tournament, which we entered right after that, we became Finalists and returned home with four different special awards. In July of the same year, we made it to the Final in TÜBİTAK 2204-C Polar Research Projects. We went to Giresun for the Final Tournament and returned home with 3rd place! Afterwards, we were selected as one of the top 10 projects in the TEKNOFEST Technology for the Benefit of Humanity Final in Rize in August, and we became the 9th in Turkey with my team in the Turkish Natural Language Processing competition held in the same month. We celebrated all of these achievements at TEKNOFEST KARADENIZ in September 2022!\n\n',
    },
    'f7tj702i': {
      'tr': 'Fotoğraflar',
      'en': 'Photos',
    },
    '3osfjnqt': {
      'tr': 'Yavuz Selimhan Kaya',
      'en': 'Yavuz Selimhan Kaya',
    },
    'hkqn9hhs': {
      'tr': 'Hakkımda',
      'en': 'About Me',
    },
    'nkoz6oa0': {
      'tr':
          'Ben Yavuz, eğer siteyi güncellemeyi unutmadıysam şu an 11.sınıfa gidiyorum. Bilgisayarlarla aşinalığım küçüklüğümden geliyor. Yazılım konusunda kendimi geliştirmeye Lise Hazırlıkta başladım. Önce küçük projeler ile daha sonrasında ise kendi geliştirdiğim oyun ile atıldığım maceram şu anda çok ayrı bir boyut aldı. İlgilerimin farklı yönlerde olduğunu anladım.\n\n',
      'en':
          'I\'m Yavuz, if I haven\'t forgotten to update the site, I\'m currently going to the 11th grade. My familiarity with computers comes from my childhood. I started to develop myself in software in High School Preparatory. First with small projects, and then with the game I developed myself, my adventure has now taken a very different dimension. I realised that my interests are in different directions.\n\n',
    },
    'jq0wg5ka': {
      'tr': 'Flutter',
      'en': 'Flutter',
    },
    '8jmupesb': {
      'tr':
          '9.sınıfta Tübitak projesi olarak uygulama tasarlamak için Flutter ile tanıştım. Öncelikle internetteki hazır templateler ile bir uygulama geliştirdim. Daha sonrasında Tübitak ile işim bitince uygulamayı en baştan Firestore ile oluşturmaya başladım. Daha sonrasında kendimi geliştirip birden fazla Flutter uygulamasını App Store ve Google Play\'de yayınladım. Şu anda bu görüntülediğiniz websitesi Flutter üzerinden oluşturuldu! Aynı zamanda tüm oyun yama setuplarımın tamamı da Flutter üzerinden oluşturuldu! Her geçen gün kendimi bu mavi ekibe daha da ait hissediyorum. 💙\n\n',
      'en':
          'In 9th grade, I met Flutter to design an application as a Tübitak project. First of all, I developed an application with ready-made templates on the internet. Later, when I was done with Tübitak, I started to create the application from the beginning with Firestore. Later, I improved myself and published more than one Flutter application on the App Store and Google Play. The website you are viewing right now was created on Flutter! At the same time, all of my game patch setups were created on Flutter! Every day I feel more and more belonging to this blue team 💙\n\n',
    },
    '6d5c1rgf': {
      'tr': 'Çevirmenlik',
      'en': 'Translation',
    },
    'sdawsa6p': {
      'tr':
          '2021 yılında yeni satın almış olduğum video oyununda Türkçe dil desteği olmaması sebebi ile kendimi oyun yama platforlarında buldum. Daha sonrasında ilk bana verilen görev olarak Dishonored: Death Of The Outsider projesinde Çevirmen olarak yer aldım. Bu süreçte çok zevk aldığımdan dolayı aynı şirketin yeni çıkartmış olduğu \"DEATHLOOP\" oyunun çevirisini kendim üstlendim ve bir ekip oluşturarak sıfırdan çeviri yapmaya başladık. Sonrasında Sunset Overdrive, Demon Slayer gibi daha büyük işlere giriştim. Şu anda kendi forumum ve Discordum üzerinden çalışmalara devam ediyoruz! ceviri.cidqu.net\n\n',
      'en':
          'In 2021, I found myself on game patch platforms due to the lack of Turkish language support in the video game I had just purchased. Afterwards, I took part as a Translator in the Dishonored: Death Of The Outsider project as the first task given to me. Since I enjoyed this process very much, I undertook the translation of the \"DEATHLOOP\" game, which was recently released by the same company, and we started translating from scratch by creating a team. Afterwards, I embarked on bigger works such as Sunset Overdrive, Demon Slayer. We are currently continuing to work on my own forum and Discord! ceviri.cidqu.net\n\n',
    },
    'f3bq3tkq': {
      'tr': 'Reverse Engineering',
      'en': 'Reverse Engineering',
    },
    'gtk9npf8': {
      'tr':
          'Çeviri heyecanımın ilerlemesi ile beraber kendimi büyük bir problemin içerisinde buldum. Oyunların dil dosyalarını açmak, düzenlemek ve sonrasında oyun geri aktarmak çok büyük bir problemdi. Bunun için üst düzey yazılım bilgisi gerekiyordu. Zenhax ve Xentax forumlarında çoğu kişi yardım etse de artık kendimin bir yolunu bulmam gerektiğini hissetmişim. İnternetteki bit çok kaynaktan araştırmalar yaparak, Table Offset Pointer gibi temel bilgileri edindim. Daha sonrasında Lucy, h3x3r gibi anonim kullanıcılar sayesinde kendimi eğitim alanının ortasında bulmuştum. 2 Yılı aşkındır devam eden bu denemeler sayesinde artık dosyaları özellikle oyunları Reverse Engineering methodları ile açmayı düzenlemeyi öğrendim. Kendi geliştirdiğim ilk araç Plague Tale Requiem Font Aracı oldu. Daha sonrasında hem GitHub üzerinde hem de özel bir şekilde çokça araç geliştirerek öğrenimime devam ettim ve hala etmekteyim.\n\n',
      'en':
          'As my translation excitement progressed, I found myself in a big problem. Opening, editing and then transferring the language files of the games back to the game was a huge problem. High level software knowledge was required for this. Although many people helped me in Zenhax and Xentax forums, I felt that I had to find a way myself. By doing research from many sources on the internet, I acquired basic knowledge such as Table Offset Pointer. Later, thanks to anonymous users such as Lucy, h3x3r, I found myself in the middle of the education field. After more than 2 years of these experiments, I have learnt to open and edit files, especially games, with Reverse Engineering methods. The first tool I developed myself was the Plague Tale Requiem Font Tool. Afterwards, I continued my learning by developing a lot of tools both on GitHub and privately, and I am still continuing.\n\n',
    },
    '2jcxiv35': {
      'tr': 'FRC, VRC ve TEKNOFEST',
      'en': 'FRC, VRC ve TEKNOFEST',
    },
    'ani3z53h': {
      'tr':
          '2022 Yılının Mart ayında FRC İstanbul Regional Turnuvasında katıldık, yazılım kaptanlığını üstendiğim turnuvada şampiyon olup Houston\'daki büyük finale girmeye hak kazandık! Hemen onun peşine girmiş olduğumuz VRC İstanbul turnuvasında ise Finalist olup dört farklı özel ödül ile evimize geri döndük. Aynı senenin Temmuz ayında TÜBİTAK 2204-C Kutup Araştırma Projelerinde Finale kaldık. Final Turnuvası için Giresun\'a gittik ve 3.lük alarak evimize geri döndük! Sonrasında Ağustos ayında Rize\'de TEKNOFEST İnsanlık Yararına Teknoloji Finalinde en iyi 10 projeden biri seçildik ve aynı ay içerisinde gerçekleşen Türkçe Doğal Dil İşleme yarışmasında takımımla birlikte Türkiye 9.su olduk. Bu başarıların hepsini 2022 Eylül\'de TEKNOFEST KARADENİZ\'de kutladık!\n\n',
      'en':
          'In March 2022, we participated in the FRC Istanbul Regional Tournament, where I was the software captain, we became the champion and qualified for the grand final in Houston! In the VRC Istanbul tournament, which we entered right after that, we became Finalists and returned home with four different special awards. In July of the same year, we made it to the Final in TÜBİTAK 2204-C Polar Research Projects. We went to Giresun for the Final Tournament and returned home with 3rd place! Afterwards, we were selected as one of the top 10 projects in the TEKNOFEST Technology for the Benefit of Humanity Final in Rize in August, and we became the 9th in Turkey with my team in the Turkish Natural Language Processing competition held in the same month. We celebrated all of these achievements at TEKNOFEST KARADENIZ in September 2022!\n\n',
    },
    '3imr03js': {
      'tr': 'Fotoğraflar',
      'en': 'Photos',
    },
    'ycmxdy2e': {
      'tr': 'Home',
      'en': 'Home',
    },
  },
  // bana_ulasin
  {
    'mjd9gzwp': {
      'tr': 'İletişim Formu!',
      'en': 'Contact Form!',
    },
    'cfcwav42': {
      'tr': 'İsim',
      'en': 'Name',
    },
    '9lestbzd': {
      'tr': 'İsim...',
      'en': 'Name...',
    },
    'jjusqpvz': {
      'tr': 'Konu',
      'en': 'Subject',
    },
    'jajvq1ng': {
      'tr': 'Konu...',
      'en': 'Subject...',
    },
    'zxwg38ot': {
      'tr': 'Mesaj',
      'en': 'Message',
    },
    'gd3t53b9': {
      'tr': '.',
      'en': '.',
    },
    'm5dq3bsw': {
      'tr': 'Gönder',
      'en': 'Sent',
    },
    't399n9yb': {
      'tr': 'Bana Ulaşın',
      'en': 'Contact Me',
    },
    'svfbaxtv': {
      'tr': 'Home',
      'en': 'Home',
    },
  },
].reduce((a, b) => a..addAll(b));
